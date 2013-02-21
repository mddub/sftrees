(ns trees.web
  (:use [ring.adapter.jetty :only [run-jetty]])
  (:use [ring.middleware.resource :only [wrap-resource]])
  (:use [ring.middleware.file-info :only [wrap-file-info]])
  (:use [ring.util.response :only [resource-response response]])
  (:require [clj-http.client :as client]))

(defn proxy-request [req]
  (client/get (str "http://localhost:5777" (:uri req) "?" (:query-string req))))

(defn handler [req]
  (cond
    (= (:uri req) "/") (resource-response "trees.html" {:root "frontend"})
    (= (:uri req) "/trees") (proxy-request req)
    (= (:uri req) "/species") (proxy-request req)))

(def app
  (-> handler
      (wrap-resource "frontend")
      (wrap-file-info)))

(defn -main [port]
  (run-jetty app {:port (Integer. port)}))
