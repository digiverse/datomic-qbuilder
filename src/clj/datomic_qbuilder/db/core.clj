(ns datomic-qbuilder.db.core
  (:require
    [com.rpl.specter :as sp]
    [clojure.tools.logging :as log]
    [datomic.api :as d]
    [io.rkn.conformity :as c]
    [mount.core :refer [defstate]]
    [datomic-qbuilder.config :refer [env]]
    [clojure.string :as str]))

(defstate conn
          :start (do (-> env :database-url d/create-database) (-> env :database-url d/connect))
          :stop (-> conn .release))

(defn get-current-db [] (d/db conn))

(defn retract-attribute
  [att]
  (let [es (d/q [:find '[?e ...] :where ['?e att]] (get-current-db))
        txs (map #(vector :db/retract % att) es)]
    (d/transact conn txs)))

(defn delete-schema
  []
  (let [att-list [:qbuilder.schema/refsEntity :qbuilder.schema/implements :qbuilder.schema/type]]
    (doall (map retract-attribute att-list))))

(defn transact-sync
  [s]
  @(d/transact conn s))

(defn install-schema
  "This function expected to be called at system start up.

  TODO: automatic schema?
  TODO: maybe use conformity:
  Datomic schema migrations or db preinstalled data can be put into 'migrations/schema.edn'
  Every txes will be executed exactly once no matter how many times system restart."
  []
  (log/info "Deleting existing QBuilder schema....")
  (try (delete-schema)
       (log/info "Existing QBuilder schema successfully deleted.")
       (catch Exception e (log/info (str "...existing QBuilder schema NOT deleted (it probably does not exist): "
                                         (.getMessage e)))))
  (log/info "Installing QBuilder schema...")
  (let [norms-map (c/read-resource "migrations/schema.edn")
        base-txes (:txes (:qbuilder/base-schema norms-map))
        suppl-txes (:txes (:qbuilder/supplemental-schema norms-map))]
    #_(c/ensure-conforms conn norms-map)                    ;; TODO...
    (doall (map transact-sync base-txes))
    (doall (map transact-sync suppl-txes)))
  (log/info "...QBuilder schema installed!"))

;; automatically install the qbuilder schema upon system startup (TODO: find better way?)
(defstate install-qbuilder-schema
          :start (install-schema))

(defn flatten-db-ident
  "if there's a nested :db/ident (result of a pull expression), leave the value of that.
  all maps with the :db/ident key are referencing enums we want to unwrap e.g. {:db/ident :someEnum} -> :someEnum
  TODO: we could use xform on pull."
  [v]
  (sp/transform [sp/ALL sp/MAP-VALS #(and (map? %) (:db/ident %))] :db/ident v))

(defn not-system-entity? [m]
  (let [ns (namespace (:db/ident m))]
    (not (or (str/starts-with? ns "db")
             (str/starts-with? ns "fressian")))))

(defn get-schema
  "Gets the currently installed schema attributes"
  []
  (let [db (d/db conn)]
    (->> (mapv #(->> %
                     first
                     (d/entity db)
                     d/touch
                     (into {}))
               (d/q '[:find ?v
                      :where [_ :db.install/attribute ?v]]
                    db))
         (filter not-system-entity?)
         (flatten-db-ident))))

(defn parse-attribute [m]
  (let [type (name (:db/valueType m))
        entity (:qbuilder.schema/refsEntity m)
        enum (:qbuilder.schema/refsEnum m)
        unique (if-let [v (:db/unique m)] (keyword (name v)))
        index (:db/index m)]
    (cond-> {:name        (str (:db/ident m))
             :type        type
             :cardinality (keyword (name (:db/cardinality m)))
             :doc         (:db/doc m)}
            entity (assoc :entity (set (map str entity)))
            enum (assoc :enum enum)
            index (assoc :index true)
            unique (assoc :unique unique))))

(defn get-entity-attributes
  "Get the attributes of an entity by entity name (keyword or string)"
  [entity]
  (let [ent-kw (keyword entity)]
    (->> (get-schema)
         (filter #(= ent-kw (keyword (namespace (:db/ident %)))))
         (mapv parse-attribute))))

(defn parse-entity-type [m]
  {:name       (str (:db/ident m))
   :doc        (:db/doc m)
   :implements (or (:db/ident (:qbuilder.schema/implements m)) [])
   :attributes (get-entity-attributes (:db/ident m))})

(defn parse-interface-type [m]
  {:name (:db/ident m)
   :doc  (:db/doc m)})

(defn get-qbuilder-schema-type
  "Get qbuilder entities by qbuilder attribute :qbuilder.schema/type"
  [conn qbuilder-type]
  (let [db (d/db conn)
        ents (d/q '[:find [(pull ?e [:db/ident
                                     :db/doc
                                     {:qbuilder.schema/implements [:db/ident]}])
                           ...]
                    :in $ ?schema-type
                    :where
                    [?e :qbuilder.schema/type ?schema-type]]
                  db qbuilder-type)]
    ents))

(defn get-entities []
  (->> (get-qbuilder-schema-type conn :qbuilder.schema/entity)
       (mapv parse-entity-type)))

(defn get-interfaces []
  (->> (get-qbuilder-schema-type conn :qbuilder.schema/interface)))

(defn get-enum-namespaces []
  (->> (d/q '[:find [?enum-ns ...]
              :where [?e :qbuilder.schema/refsEnum ?enum-ns]
              ] (d/db conn))))

(defn get-enum-values [enum-ns]
  (d/q '[:find [?a ...]
         :in $ ?enum-ns
         :where
         [?f :db/ident ?a]
         [(namespace ?a) ?ns]
         [(= ?ns ?enum-ns)]
         ] (d/db conn) enum-ns))

;; TODO: enrich enums (add :doc attribute)
(defn get-enums []
  (mapv
    #(hash-map :name % :values (mapv str (get-enum-values %)))
    (get-enum-namespaces)))

(defn get-qbuilder-schema []
  {:entities   (get-entities)
   :interfaces (get-interfaces)
   :enums      (get-enums)})

;; query datomic functions

(defn paginate [page-size from col]
  (->> (drop from col)
       (take page-size)))

(defn sort-result [sort-fns sort-cmps col]
  (sort-by (apply juxt sort-fns) sort-cmps col))

(defn resolve-idents
  "Helper that resolves all idents (enums) resulted from a pull expression to their :db/ident keyword."
  [db x]
  (cond (map? x)
        (if-let [ident (d/ident db (:db/id x))]
          (str ident)                                       ;;coercion removes : from keywords...
          (reduce-kv (fn [x k v]
                       (assoc x k (resolve-idents db v)))
                     x x))
        (vector? x)
        (map #(resolve-idents db %) x)
        :else
        x))

(defn process-pull-pattern [db pull-pattern col]
  (if (or (= pull-pattern "[]")
          (= pull-pattern ""))
    col
    (->> (d/pull-many db pull-pattern col)
         (resolve-idents db))))

(defn prepare-specter-fn-nil-last
  "prepares two functions from specter path string, the first one is for sorting nil last"
  [specter-path-str]
  (let [sp (sp/comp-paths (load-string specter-path-str))
        nil-fn #(not (sp/compiled-selected-any? sp %))
        select-fn #(sp/compiled-select-first sp %)]
    [nil-fn select-fn]))

(defn prepare-sort-fns
  "prepares a vector of sort functions (that are used to extract a value from a map)  according to :sortExpression values"
  [sort-attrs]
  (vec (mapcat #(prepare-specter-fn-nil-last (:sortExpression %)) sort-attrs)))

(defn compare-inv [x y] (compare y x))

(defn compare-many
  "custom comparator that compares by a vector of comparison functions (used for sorting in asc/dsc manner)"
  [comps]
  (fn [xs ys]
    (if-let [result (first (drop-while zero? (map (fn [f x y] (f x y)) comps xs ys)))]
      result
      0)))

(defn prepare-sort-comparator [sort-order]
  ;; first compare is for nil last sort function
  (if (= sort-order "dsc") [compare compare-inv] [compare compare]))

(defn prepare-sort-comparators
  "prepares a vector of sort comparators according to :sortOrder values (used for sorting the vector of sort functions in asc/dsc manner)"
  [sort-attrs]
  (compare-many (vec (mapcat #(prepare-sort-comparator (:sortOrder %)) sort-attrs))))

(defn query-datomic
  "performs a datomic query, returns the specified page of the result (from is the start index, page-size is the size)."
  [db find where pull sort-attrs page-size from]
  (let [query (hash-map
                :find (clojure.edn/read-string find)
                :where (clojure.edn/read-string where))
        result (if sort-attrs (d/query {:query query :args [db]})
                              (d/qseq {:query query :args [db]}))
        total (count result)]
    (->> (if sort-attrs
           (let [sort-fns (prepare-sort-fns sort-attrs)
                 sort-cmps (prepare-sort-comparators sort-attrs)]
             (->> (process-pull-pattern db pull result)
                  (sort-result sort-fns sort-cmps)
                  (paginate page-size from)))
           (->> (paginate page-size from result)
                (process-pull-pattern db pull)))
         (hash-map :total total :hits))))

;; entity exploration functions
(defn transform-entity-maps
  "Transforms all datomic EntityMap instances to a map that contains only the :db/id key/value pair"
  [m]
  (sp/transform (sp/walker #(instance? datomic.query.EntityMap %)) #(select-keys % [:db/id]) m))

(defn- get-rev-attr-to-entity-map
  "returns a seq of maps of reverse attributes (:attribute) and corresponding entity id (:entity)
  e.g.
  ({:attribute :abstractRelease/artists, :entity 17592186062936}
  {:attribute :release/artists, :entity 17592186075042}
  {:attribute :track/artists, :entity 1073123348855151}
  {:attribute :track/artists, :entity 1073123348855152})"
  [db entid]
  (map #(hash-map
          :attribute (d/ident (get-current-db) (:a %))
          :entity (:e %))
       (d/datoms db :vaet entid)))

(defn get-entity-reverse-attrs
  "returns a map of reverse attributes and their corresponding entities:
  key is the reverse attribute,
  value is a vector of entity ids that point to the given entity by the reverse attribute"
  [db entid]
  (reduce
    (fn [acc curr]
      (let [att (:attribute curr)
            ent (:entity curr)]
        (if-let [existing-att-val (att acc)]
          (assoc acc (str att) (conj existing-att-val ent))
          (assoc acc (str att) (vector ent)))))
    {}
    (get-rev-attr-to-entity-map db entid)))

(defn get-entity-attr-data
  "returns a map of all entity attributes and their values"
  [db entid]
  (let [entity (d/entity db entid)]
    (assoc (into {} entity) :db/id (:db/id entity))))

(defn get-entity-data
  "returns a map of all entity attributes and under key :reverse-attributes, all non-entity attributes with count
  that point to the given entity. Those attributes can later be used as the input for get-entity-reverse-att-values
  function to get the relevant entity ids. NOTE: the parameter entid is a String and can also be a lookup-ref."
  [db entid]
  (let [entid-l (clojure.edn/read-string entid)]
    (transform-entity-maps
      (conj (get-entity-attr-data db entid-l)
            (assoc {} :reverse-attributes (get-entity-reverse-attrs db entid-l))))))

(defn save-query
  "saves the query"
  [^String query-name ^String find ^String where ^String pull]
  (let [query (str (hash-map
                     :find (clojure.edn/read-string find)
                     :where (clojure.edn/read-string where)
                     :pull (clojure.edn/read-string pull)))
        tx-map {:db/id               "tempid"
                :qbuilder.save/name  query-name
                :qbuilder.save/query query}
        tx [tx-map]]
    (d/transact conn tx)
    "OK"))

(defn get-saved-queries
  "returns a vector of saved query names"
  []
  (let [res (d/q '[:find [?name ...]
                   :where [?e :qbuilder.save/name ?name]]
                 (get-current-db))]
    res))

(defn get-saved-query
  "gets the given saved query"
  [^String query-name]
  (let [query (d/q '[:find ?query .
                     :in $ ?name
                     :where [?e :qbuilder.save/name ?name]
                     [?e :qbuilder.save/query ?query]]
                   (get-current-db) query-name)
        parsed (clojure.edn/read-string query)]
    (hash-map :find (str (:find parsed))
              :where (str "["
                          (apply str (interpose "\n" (:where parsed)))
                          "]")
              :pull (str (:pull parsed)))))




