(ns pointless.ui)

(defn refresh [slide template progress]
  )

(defn- render-slide [slide html fields]
  (let [div (.createElement js/document "div")
        container (.querySelector js/document ".slide-container")]
    (set! (.-innerHTML div) (render-template slide html fields))
    (set! (.-innerHTML container) "")
    (.appendChild container div)))

(defn- render-template [slide template fields]
  (reduce (fn [template field]
            (clojure.string/replace 
              template
              (str "{{" field.name "}}")
              (get slide field.name)))
          template))

(defn- update-style [css]
  (let [style 
        (if (nil? (.querySelector js/document "style[data-css]"))
          (create-style (js/document.head.appendChild))
          (.querySelector js/document "style[data-css]"))]
    (set! (.-textContent style) css)))

(defn- create-style [attach]
  (let [style 
        (.createElement js/document "div")]
    (.setAttribute style "data-css" "")
    (attach style)))
