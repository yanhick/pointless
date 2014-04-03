(ns code_mirror_wrapper)

(defn init [on-change presentation]
  (js/console.log (get (get presentation "template") "html"))
  (let [html-editor 
       (js/CodeMirror 
          (.querySelector js/document ".template .html")
          (clj->js {:mode "htmlmixed"
           :value (get (get presentation "template") "html")
           :lineNumbers true}))
        css-editor 
        (js/CodeMirror
          (.querySelector js/document ".template .css")
          (clj->js {:mode "css"
           :value (get (get presentation "template") "css")
           :lineNumbers true}))
        on-change (fn []
                    (on-change 
                      (.getValue html-editor)
                      (.getValue css-editor)))]
    (.on html-editor "change" on-change)
    (.on css-editor "change" on-change)))

