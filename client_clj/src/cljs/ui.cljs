(ns pointless.ui)

(defn refresh [slide template progress]
  (update-style template.css)
  (render-slide slide template.html template.fields))

(defn- render-slide [slide html fields]
  (let [div (.createElement js/document "div")
        container (.querySelector js/document ".slide-container")]
    (set! (.-innerHTML div) (render-template slide html fields))
    (set! (.-innerHTML container) "")
    (.appendChild container div)))

(defn- render-template [slide template fields]
  (reduce
    (fn [template field]
      (clojure.string/replace 
        template 
        (str "{{" field.name "}}")
        (get slide field.name)))
    template
    fields))

(defn- update-style [css]
  (let [style (.getElementById js/document "slides-css")]
    (set! (.-textContent style) css)))
