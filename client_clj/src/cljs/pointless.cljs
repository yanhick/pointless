(ns pointless.main 
  (:require pointless.user-interaction
            pointless.api))

(defn init
  [err data]
  (pointless.user-interaction.listen-keyboard
    #() #() #() #())
  (pointless.user-interaction.listen-slide-change
    #())
  (pointless.user-interaction.listen-buttons
    #() #() #() #() #() #()))

(set! (.-onload js/window) (partial pointless.api.load 1234 init))
