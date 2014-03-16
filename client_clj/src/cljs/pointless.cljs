(ns pointless.main 
  (:require pointless.user-interaction))
PrintS  
(defn init 
  []
  (.write js/document "App loaded")
  (pointless.user-interaction.on-key-up)
  (pointless.user-interaction.listen-keyboard []))

(set! (.-onload js/window) init)
