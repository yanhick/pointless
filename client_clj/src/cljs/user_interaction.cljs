(ns user_interaction)

(defn- on-key-up
  [on-left on-right on-esc e]
  (case (.-keyCode e)
    37 (on-left)
    39 (on-right)
    27 (on-esc)
    nil))

(defn listen-keyboard
  [on-right on-left on-esc]
  (.addEventListener js/document "keyup"
                     (partial on-key-up
                              on-left on-right on-esc )))

