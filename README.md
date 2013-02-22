# sftrees

Web app for visualizing all the registered trees in SF. Also, my first Clojure app ever.

Currently running at http://stark-hamlet-6403.herokuapp.com/

Written as an assignment for a Clojure learning group. Intended to communicate with a [backend service][1] providing REST access to (a) a list of species ordered by frequency and (b) a list of lat/lng pairs for all trees of a given species.

Includes some poorly-written, assuredly not idiomatic Clojure, and some very hastily written JavaScript.

Original data at https://data.sfgov.org/Public-Works/Street-Tree-List/tkzw-k3nq.

[1]: https://github.com/jolleon/clj-trees
