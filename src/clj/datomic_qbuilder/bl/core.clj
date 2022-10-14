(ns datomic-qbuilder.bl.core
  (:import (clojure.lang Symbol)))

(defn eavt-tuple-to-map
  [tup]
  (if (= (type (first tup)) Symbol)
    (let [[e a v t] tup]
      {:e e :a (str a) :v (str v) :t t})
    (str tup)))

(defn convert-str
  [x]
  (let [x-str (str x)
        parsed (clojure.edn/read-string x-str)]
    (cond
      (= "" x-str) nil
      (= "." x-str) (symbol x-str)
      (= "..." x-str) (symbol x-str)
      (= "*" x-str) (symbol x-str)
      (= "_" x-str) (symbol x-str)
      (number? parsed) parsed
      (.startsWith x-str "?") (symbol x-str)
      (.startsWith x-str ":") (keyword (subs x-str 1))
      (.startsWith x-str "[") parsed
      (.startsWith x-str "{") parsed
      :else x)))

(defn eavt-map-to-tuple
  [m]
  (if (= (type m) String)
    m
    (let [{:keys [e a v t]} m]
      (vec (filter some? [(convert-str e) (convert-str a) (convert-str v) (convert-str t)]))
      )))

(defn query-to-builder-model
  "TODO"
  [find-str where-str pull-str]
  (let [f (clojure.edn/read-string find-str)
        w (clojure.edn/read-string where-str)
        p (clojure.edn/read-string pull-str)]
    {:find  f
     :where (mapv eavt-tuple-to-map w)
     :pull  (mapv str p)}
    ))

(defn query-from-builder-model
  "TODO"
  [{:keys [find where pull]}]
  (let [[f :as all] find
        find-str (if (vector? f)
                   (str "[" (mapv convert-str f) "]")
                   (str "[" (apply str (interpose " " all)) "]"))
        where-str (str "["
                       (apply str (interpose "\n" (mapv eavt-map-to-tuple where)))
                       "]")
        pull-str (str (mapv convert-str pull))]
    {:find  find-str
     :where where-str
     :pull  pull-str}))

(comment
  (query-to-builder-model "[[?e ...]]" "[[?e :release/artist][?e :test ?g]]" "[:artist/name]")
  (def a
    (query-to-builder-model "[[?e ...]]" "[[?e :release/artist][(smth ?e) ?g]]" "[:artist/name]"))
  (def builder-model
    {:find  '[[?e ...]]
     :where '[{:e ?e, :a :release/artist, :v "testing", :t nil}
              {:e ?e, :a :test, :v "1233", :t nil}]
     :pull  '[:test/test, {:testing/test [:test/test]}]})
  (query-from-builder-model builder-model))
