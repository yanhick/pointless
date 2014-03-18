(ns pointless.user-interaction)

(defn listen-keyboard
  [on-up on-right on-down on-left]
  (.addEventListener js/document "keyup"
                     (partial on-key-up
                              on-up on-right on-down on-left)))

(defn- on-key-up
  [on-up on-right on-down on-left e]
  (case e/keyCode
    37 (on-left)
    38 (on-up)
    39 (on-right)
    40 (on-down)))

(defn listen-slide-change
  [update-slide]
  (.addEventListener
    (.querySelector js/document ".content")
    "input" 
    (fn [] (update-slide get-inputs-content))))

(defn- get-inputs-content
  []
  (let [inputs (.querySelectorAll js/document ".content textarea, .content input")]
    (reduce 
      (fn [content input]
        (conj content {(.-name input) (.-value input)}))
      {}
      inputs)))

(defn listen-buttons
  [on-insert on-delete on-goto-slide on-copy-slide
   on-swap-slide on-fullscreen]
  (let [listen (fn [selector cb] 
                 (.addEventListener (.querySelector js/document selector) "click" cb))
        get-index 
        (fn [] 
          (let 
            [index 
             (.-value 
               (.querySelector js/document ".buttons [type=number]"))]
            (- (js/parseInt index) 1)))]
    (listen ".buttons .insert" on-insert)
    (listen ".buttons .delete" on-delete)
    (listen ".buttons .fullscreen" on-fullscreen)
    (listen ".buttons .goto" (partial on-goto-slide get-index))
    (listen ".buttons .copy" (partial on-copy-slide get-index))
    (listen ".buttons .swap" (partial on-swap-slide get-index))))

