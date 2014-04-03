(ns ui
  (:require 
    [clojure.string]))

(defn- render-template [slide template fields]
  (reduce
    (fn [template field]
      (clojure.string/replace
        template
        (str "{{" (get field "name") "}}")
        (get slide (get field "name"))))
    template
    fields))

(defn- render-slide [slide html fields]
  (let [div (.createElement js/document "div")
        container (.querySelector js/document ".slide-container")]
    (set! (.-innerHTML div) (render-template slide html fields))
    (set! (.-innerHTML container) "")
    (.appendChild container div)))

(defn- update-style [css]
  (let [style (.getElementById js/document "slides-css")]
    (set! (.-textContent style) css)))

(defn refresh [presentation index]
  (update-style (get (get presentation "template") "css"))
  (render-slide 
    (get (get presentation "slides") index)
    (get (get presentation "template") "html")
    (get (get presentation "template") "fields")))

