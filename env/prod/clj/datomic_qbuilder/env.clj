(ns datomic-qbuilder.env
  (:require [clojure.tools.logging :as log]))

(def defaults
  {:init
   (fn []
     (log/info "\n-=[datomic-qbuilder started successfully]=-"))
   :stop
   (fn []
     (log/info "\n-=[datomic-qbuilder has shut down successfully]=-"))
   :middleware identity})
