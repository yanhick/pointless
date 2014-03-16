(defproject client_clj "0.1.0-SNAPSHOT"
  :description "FIXME: write description"
  :url "http://example.com/FIXME"
  :license {:name "Eclipse Public License"
            :url "http://www.eclipse.org/legal/epl-v10.html"}

  :source-paths ["src/cljs"]
  :dependencies [[org.clojure/clojure "1.5.1"]]

  :plugins [[lein-cljsbuild "1.0.0"]]

  :cljsbuild {:builds
              [{
                :source-paths ["src/cljs"]

                :compiler {
                           :output-to "../bin/pointless.js"

                           :optimizations :whitespace

                           :pretty-print true}}]})
