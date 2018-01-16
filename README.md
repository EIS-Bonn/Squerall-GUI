Sparkall GUI
--
Sparkall is a query layer on top of Data Lakes. It is a Scala Play application run using SBT.

Sparkall has 3 GUIS:
- Source addition: add Source by setting values to a set of prelisted options
- Source mapping: map entities and attributes to Ontology classes and predicates
- Query: use mappings to query the data


Mappings are saved in: `conf/mappings.ttl`
Data source access configurations are saved in: `conf/config`
Query is saved in `conf/query.sparql`

You can change these configurations in the `cong/application.conf`

For more information, refer to the paper here: ["Teach me to fish" Querying Semantic Data Lakes](https://www.researchgate.net/publication/322526357_%27Teach_me_to_fish%27_Querying_Semantic_Data_Lakes)

