(ns user_interaction)

(defn- on-key-up
  [on-left on-right e]
  (case e.keyCode
    37 (on-left)
    39 (on-right)
    nil))

(defn listen-keyboard
  [on-right on-left]
  (.addEventListener js/document "keyup"
                     (partial on-key-up
                              on-left on-right )))

