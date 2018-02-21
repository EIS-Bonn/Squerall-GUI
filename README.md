# Sparkall-GUI
Sparkall-GUI is the user interface of [Sparkall](https://github.com/mnmami/sparkall), which is a solution for querying Data Lakes in a unified manner. Sparkall-GUI produces three input files used by Sparkall. Sparkall-GUI is a Web Scala Play application run using SBT.

## Execution
To build and run the Sparkall-GUI, simply run:
`sbt compile` then
`sbt run`.

Sparkall-GUI consits of three interfaces:
- **1. Source injestion:** add a source by setting values to a set of prelisted options, mostly used by Spark.
- **2. Source mapping:** map data entities and attributes to Ontology classes and predicates.
- **3. Query:** query the data using Ontology terms frop the mappings built by 2.

Each of the previous interfaces outputs a file that is used by Sparkall:

1. Data source access configurations are saved in: `conf/config`
2. Mappings are saved in: `conf/mappings.ttl`
3. Query is saved in `conf/query.sparql`

You can change the path to these files in `cong/application.conf`.

For more information, refer to the paper here: ["Teach me to fish" Querying Semantic Data Lakes](https://www.researchgate.net/publication/322526357_%27Teach_me_to_fish%27_Querying_Semantic_Data_Lakes)

Screencasts of Sparkall GUIs: https://drive.google.com/drive/folders/10mkwMrbuxv71gtwE2etDzqANt8S9YXhr

For more enquireis, contact me on: mami@cs.uni-bonn.de
