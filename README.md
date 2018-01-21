# Sparkall GUI
Sparkall is a query layer on top of Data Lakes. Sparkall-GUI is a Web interface that buils the three input files used by Sparkall. Sparkall-GUI is a Scala Play application run using SBT.

## Execution
To build and run the Sparkall-GUI, simple run:
`sbt compile`
Then:
`sbt run`

Sparkall-GUI consits of three interfaces:
- **1. Source addition:** add a source by setting values to a set of prelisted options, mostly used by Spark.
- **2. Source mapping:** map data entities and attributes to Ontology classes and predicates.
- **3. Query:** querty the data using a Ontology terms frop the mappings built by 2.

Mappings are saved in: `conf/mappings.ttl`
Data source access configurations are saved in: `conf/config`
Query is saved in `conf/query.sparql`

You can change these configurations in the `cong/application.conf`

For more information, refer to the paper here: ["Teach me to fish" Querying Semantic Data Lakes](https://www.researchgate.net/publication/322526357_%27Teach_me_to_fish%27_Querying_Semantic_Data_Lakes)

For more enquireis, contact me on: mami@cs.uni-bonn.de


