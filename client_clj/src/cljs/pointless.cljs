(ns pointless.main
  (:require [pointless.user-interaction :as user-interaction]
            [pointless.fullscreen :as fs]
            [pointless.presentation :as presentation]
            [pointless.code-mirror-wrapper :as cm]
            [pointless.pagination :as pagination]
            [pointless.api]))
            

(def presentation-data (atom {}))
(def index (atom 0))

(defn get-index []
  @index)

(defn get-presentation []
  @presentation-data)

(defn init
  [err data]
  (update-pres (js->clj (js/JSON.parse data)))
  (pointless.code-mirror-wrapper.init
    pointless.presentation.update-template
    (get-presentation))
  (listen-user))

(defn listen-user []
  (pointless.user-interaction.listen-keyboard
    (comp update-index
          (partial pointless.pagination.next
             get-index
             (partial pointless.pagination.next?
                      get-index
                      (get (get-presentation) "slides"))))
    (comp update-index
          (partial pointless.pagination.previous
             get-index))))

(defn update-pres
  [new-presentation-data]
  (swap! presentation-data (fn [] new-presentation-data)))

(defn update-index
  [new-index]
  (swap! index (fn [] new-index)))

(set! (.-onload js/window) (partial pointless.api.load 1234 init))

