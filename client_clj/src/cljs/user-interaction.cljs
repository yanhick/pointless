(ns pointless.user-interaction)

(defn listen-keyboard
  [on-right on-left on-cmd1 on-cmd2]
  (.addEventListener js/document "keyup"
                     (partial on-key-up
                              on-left on-right on-cmd1 on-cmd2)))

(defn- on-key-up
  [on-left on-right on-cmd1 on-cmd2 e]
  (case e/keyCode
    37 (on-left)
    39 (on-right)))
