(ns ui
  (:require 
    [clojure.string]))

(defn- render-template [slide template]
  (reduce
    (fn [template field]
      (js/console.log (get field 0))
      (js/console.log (get field 1))
      (clojure.string/replace
        template
        (str "{{" (get field 0) "}}")
        (get field 0)))
    template
    slide))

(defn- render-slide [slide html]
  (let [div (.createElement js/document "div")
        container (.querySelector js/document ".slide-container")]
    (set! (.-innerHTML div) (render-template slide html))
    (set! (.-innerHTML container) "")
    (.appendChild container div)))

(defn- update-style [css]
  (let [style (.getElementById js/document "slides-css")]
    (set! (.-textContent style) css)))

(defn refresh [presentation index]
  (update-style (get (get presentation "template") "css"))
  (render-slide
    (get (get presentation "slides") index)
    (get (get presentation "template") "html")))

