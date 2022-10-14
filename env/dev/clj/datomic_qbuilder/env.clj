(ns datomic-qbuilder.env
  (:require
    [selmer.parser :as parser]
    [clojure.tools.logging :as log]
    [datomic-qbuilder.dev-middleware :refer [wrap-dev]]))

(def defaults
  {:init
   (fn []
     (parser/cache-off!)
     (log/info "\n-=[datomic-qbuilder started successfully using the development profile]=-"))
   :stop
   (fn []
     (log/info "\n-=[datomic-qbuilder has shut down successfully]=-"))
   :middleware wrap-dev})
