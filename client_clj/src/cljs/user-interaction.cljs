(ns pointless.user-interaction)

(defn on-key-up
  [on-up on-right on-down on-left e]
  (case e.keyCode
    37 on-left
    38 on-up
    39 on-right
    40 on-down))

(defn listen-keyboard
  [on-up on-right on-down on-left]
  (.addEventListener js/document "keyup"
                     (partial on-key-up
                              on-up on-right on-down on-left)))

