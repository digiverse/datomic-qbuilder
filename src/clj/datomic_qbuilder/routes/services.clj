(ns datomic-qbuilder.routes.services
  (:require
    [reitit.swagger :as swagger]
    [reitit.swagger-ui :as swagger-ui]
    [reitit.ring.coercion :as coercion]
    [reitit.coercion.malli :as malli-coercion]
    [reitit.ring.middleware.muuntaja :as muuntaja]
    [reitit.ring.middleware.multipart :as multipart]
    [reitit.ring.middleware.parameters :as parameters]
    [datomic-qbuilder.bl.core :as bl]
    [datomic-qbuilder.db.core :as db]
    [datomic-qbuilder.middleware.formats :as formats]
    [ring.util.http-response :refer :all]))

;; malli schema for /api/schema endpoint

(def attributes-schema
  [:vector
   [:map {:title "SchemaAttribute"}
    [:name :string]
    [:type :string]
    [:entity {:optional true} [:set :string]]
    [:enum {:optional true} :string]
    [:cardinality [:enum :one :many]]
    [:unique {:optional true} [:enum :identity :value]]
    [:index {:optional true} :boolean]
    [:doc {:optional true} :string]]])

(def entities-schema
  [:vector
   [:map {:title "SchemaEntity"}
    [:name :string]
    [:implements {:optional true} [:vector :keyword]]
    [:doc {:optional true} :string]
    [:attributes attributes-schema]]])

(def interfaces-schema
  [:vector
   [:map {:title "SchemaInterface"}
    [:name :keyword]
    [:doc {:optional true} :string]
    [:attributes {:optional true} attributes-schema]]])

(def enums-schema
  [:vector
   [:map {:title "SchemaEnum"}
    [:name :string]
    [:doc {:optional true} :string]
    [:values [:vector :string]]]])

(def schema-response-schema
  [:map {:title "SchemaApiResponse"}
   [:entities entities-schema]
   [:interfaces {:optional true} interfaces-schema]
   [:enums enums-schema]])

;; malli schema for /api/query

(def sort-instructions-schema
  [:vector [:map {:title "SortInstruction"}
            [:sortExpression :string]
            [:sortOrder [:enum "asc" "dsc"]]]])

(def query-request-schema
  [:map {:title "QueryApiRequest"}
   [:find :string]
   [:where :string]
   [:pull :string]
   [:from :int]
   [:size {:optional true} :int]
   [:sortInstructions {:optional true} sort-instructions-schema]])

(def query-response-schema
  [:map {:title "QueryApiResponse"}
   [:total :int]
   [:hits [:sequential [:maybe any?]]]])

(def query-schema
  [:map {:title "QueryModel"}
   [:find :string]
   [:where :string]
   [:pull :string]])

(def eavt
  [:map {:title "EAVT"}
   [:e {:json-schema/example '?e} :symbol]
   [:a {:json-schema/example ":artist/name"} :string]
   [:v [:maybe :any]]
   [:t [:maybe :symbol]]])

(def query-builder-schema
  [:map {:title "QueryBuilderModel"}
   [:find [:sequential any?]]
   ;;[:where [:vector [:or eavt :string]]] ;; does not work...
   [:where [:vector [:or [:map {:closed false}] :string]]]
   [:pull [:sequential any?]]
   ])

(def save-query-schema
  [:map {:title "SaveQueryModel"}
   [:name :string]
   [:find :string]
   [:where :string]
   [:pull :string]])

(def entity-response-schema
  [:map {:closed false}])

(defn service-routes []
  ["/api"
   {:coercion   malli-coercion/coercion
    :muuntaja   formats/instance
    :swagger    {:id ::api}
    :middleware [;; swagger
                 reitit.swagger/swagger-feature
                 ;; query-params & form-params
                 parameters/parameters-middleware
                 ;; content-negotiation
                 muuntaja/format-negotiate-middleware
                 ;; encoding response body
                 muuntaja/format-response-middleware
                 ;; exception handling
                 coercion/coerce-exceptions-middleware
                 ;; decoding request body
                 muuntaja/format-request-middleware
                 ;; coercing response bodys
                 coercion/coerce-response-middleware
                 ;; coercing request parameters
                 coercion/coerce-request-middleware
                 ;; multipart
                 multipart/multipart-middleware
                 ]
    }

   ;; swagger documentation
   ["" {:no-doc  true
        :swagger {:info {:title       "datomic-qbuilder-api"
                         :version     "0.1"
                         :description "TODO..."}}}

    ["/swagger.json"
     {:get (swagger/create-swagger-handler)}]

    ["/api-docs/*"
     {:get (swagger-ui/create-swagger-ui-handler
             {:url    "/api/swagger.json"
              :config {:validator-url nil}})}]]

   ["/ping"
    {:get (constantly (ok {:message "pong"}))}]

   ["/schema"
    {:get {
           :operationId "get-db-schema"
           :tags        #{"DatabaseSchema"}
           :responses   {200 {:body schema-response-schema}}
           :handler     (fn [req] {:status 200
                                   :body   (db/get-qbuilder-schema)})}}]
   ["/entity/lookup"
    {:conflicting true
     :get         {
                   :parameters  {:query [:map [:lookupExpression :string]]}
                   :operationId "get-entity-data-by-lookup"
                   :tags        #{"EntityExplorer"}
                   :responses   {200 {:body entity-response-schema}}
                   :handler     (fn [{:keys [parameters]}]
                                  {:status 200
                                   :body   (db/get-entity-data
                                             (db/get-current-db)
                                             (->> parameters :query :lookupExpression))})
                   }}]

   ["/entity/:id"
    {:conflicting true
     :get         {
                   :parameters  {:path [:map [:id integer?]]}
                   :operationId "get-entity-data"
                   :tags        #{"EntityExplorer"}
                   :responses   {200 {:body entity-response-schema}}
                   :handler     (fn [{:keys [path-params]}]
                                  {:status 200
                                   :body   (db/get-entity-data (db/get-current-db) (:id path-params))})}}]

   ["/query"
    {:post {
            :operationId "datomic-query"
            :tags        #{"DatomicQuery"}
            :parameters  {:body query-request-schema}
            :responses   {200 {:body query-response-schema}}
            :handler     (fn [req]
                           (let [{:keys [find where pull sortInstructions size from]} (:body-params req)]
                             {:status 200
                              :body   (db/query-datomic
                                        (db/get-current-db)
                                        find
                                        where
                                        pull
                                        sortInstructions
                                        size
                                        from)}))
            }}]
   ["/query/to-builder-model"
    {:post {
            :operationId "datomic-query-to-builder-model"
            :tags        #{"DatomicQuery"}
            :parameters  {:body query-schema}
            :responses   {200 {:body query-builder-schema}}
            :handler     (fn [req]
                           (let [{:keys [find where pull]} (:body-params req)]
                             {:status 200
                              :body   (bl/query-to-builder-model find where pull)}))
            }}]
   ["/query/from-builder-model"
    {:post {
            :operationId "datomic-query-from-builder-model"
            :tags        #{"DatomicQuery"}
            :parameters  {:body query-builder-schema}
            :responses   {200 {:body query-schema}}
            :handler     (fn [req]
                           {:status 200
                            :body   (bl/query-from-builder-model (:body-params req))})
            }}]
   ["/query/save"
    {:post {
            :operationId "datomic-save-query"
            :tags        #{"DatomicQuery"}
            :parameters  {:body save-query-schema}
            :responses   {200 {:body :string}}
            :handler     (fn [req]
                           (let [{:keys [name find where pull]} (:body-params req)]
                             {:status 200
                              :body   (db/save-query name find where pull)}))
            }}]

   ["/query/load/:name"
    {:get {
           :parameters  {:path [:map [:name :string]]}
           :operationId "datomic-load-query"
           :tags        #{"DatomicQuery"}
           :responses   {200 {:body query-schema}}
           :handler     (fn [req]
                          (let [{:keys [name]} (:path-params req)]
                            {:status 200
                             :body   (db/get-saved-query name)}))}}]

   ["/query/list"
    {:get {
           :operationId "datomic-list-query"
           :tags        #{"DatomicQuery"}
           :responses   {200 {:body [:vector :string]}}
           :handler     (fn [req]
                          (let [{:keys [name]} (:path-params req)]
                            {:status 200
                             :body   (db/get-saved-queries)}))}}]

   ])

