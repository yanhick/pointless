(ns pointless
  (:require user_interaction
            fullscreen
            ui
            presentation
            code_mirror_wrapper
            pagination
            api))

(def presentation-data (atom {}))
(def index (atom 0))

(defn get-index []
  @index)

(defn get-presentation []
  @presentation-data)

(defn update-index
  [new-index]
  (swap! index (fn [] new-index))
  (ui.refresh @presentation-data (get-index)))

(defn listen-user []
  (user_interaction.listen-keyboard
    (comp update-index
          (partial pagination.next-slide
             get-index
             (partial pagination.next?
                      get-index
                      #(get (get-presentation) "slides"))))
    (comp update-index
          (partial pagination.previous-slide
             get-index))
    ui.toggle))

(defn update-pres
  [new-presentation-data]
  (swap! presentation-data 
         (fn [] 
           (merge 
             @presentation-data
             new-presentation-data)))
  (js/console.log (get @presentation-data "slides"))
  (ui.refresh @presentation-data (get-index)))

(defn init
  [err data]
  (update-pres (js->clj (js/JSON.parse data)))
  (code_mirror_wrapper.init
    update-pres
    (get-presentation))
  (listen-user))

(set! (.-onload js/window) (partial api.load 1234 init))

