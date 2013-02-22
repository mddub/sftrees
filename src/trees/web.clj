(ns trees.web
  (:use [ring.adapter.jetty :only [run-jetty]])
  (:use [ring.middleware.resource :only [wrap-resource]])
  (:use [ring.middleware.file-info :only [wrap-file-info]])
  (:use [ring.middleware.params :only [wrap-params]])
  (:use [ring.util.response :only [resource-response response]])
  (:use [ring.util.codec :only [url-encode]])
  (:use [cheshire.core :only [parse-string]])
  (:require [clj-http.client :as client]))

(defn proxy-request [req]
  (client/get (str "http://pure-headland-5044.herokuapp.com" (:uri req) "?" (:query-string req))))

(defn get-image-url [tree]
  (let [resp (client/get (str "http://ajax.googleapis.com/ajax/services/search/images?v=1.0&rsz=8&q=" (url-encode tree)))
        parsed (parse-string (:body resp))
        results ((parsed "responseData") "results")]
      ((rand-nth results) "url")))


(defn handler [req]
  (cond
    (= (:uri req) "/") (resource-response "trees.html" {:root "frontend"})
    (= (:uri req) "/species") (proxy-request req)
    (re-find #"^/trees" (:uri req)) (proxy-request req)
    (= (:uri req) "/image") (response (get-image-url ((:query-params req) "species")))))

(def app
  (-> handler
      (wrap-resource "frontend")
      (wrap-file-info)
      (wrap-params)))

(defn -main [port]
  (run-jetty app {:port (Integer. port)}))
