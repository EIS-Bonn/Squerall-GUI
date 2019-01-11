[![Gitter](https://img.shields.io/gitter/room/DAVFoundation/DAV-Contributors.svg?style=flat-square)](https://gitter.im/Squerall)

# Squerall-GUI
Squerall-GUI is the user interface complement of [Squerall](https://github.com/EIS-Bonn/Squerall), which is a solution for querying Data Lakes in a unified manner. Squerall-GUI produces three input files used by Squerall to execute queries (Config, Mappings and Query). Squerall-GUI is a Scala Play Web application run using SBT.

## Execution
To build and run Squerall-GUI, simply run:

```
sbt compile
sbt run
```
Or directly `sbt run`.

Then open your browser and navigate to `localhost:9000/squerall`.

## Usage
Squerall-GUI consists of three interfaces:
- **1. Source connection:** It shows users the list of options they need to provide to connect to a data source, those are Spark and Presto options.
- **2. Source mapping:** Using the information collected by the previous GUI, data schema is showed to the user. The user searches for Ontology properties and classes to map data attributes and entities. The search is powered by the LOV catalog, but users can enter their own terms.
- **3. SPARQL Query:** It guides users through the creation of SPARQL queries; users only provide input to widgets, the query is auto-created. The GUI uses the Ontology terms collected by the previous GUI to auto-suggest terms from the data, if users choose terms not known in the mapping, the query does not return results.

Each of the previous interfaces outputs a file that is used by Squerall:

1. Data source access configurations are saved in: `conf/config`
2. Mappings are saved in: `conf/mappings.ttl`
3. Query is saved in `conf/query.sparql`

**NOTE: correct the paths to these files in `cong/application.conf`.**

For more information, refer to the paper here: [Squerall: Virtual Ontology-Based Access to Heterogeneous and Large Data Sources](http://www.semantic-web-journal.net/system/files/swj1957.pdf)

Screencasts of Squerall GUIs available at: https://drive.google.com/drive/folders/10mkwMrbuxv71gtwE2etDzqANt8S9YXhr

## Try it
A Dockerfile is available. Navigate to where the Dockerfile is located and then run:
```
sudo docker build -t squerall-gui . # wait till finished
sudo docker run -p 9000:9000 -it --rm squerall-gui
```
Once done, open your browser at `localhost:9000/squerall`.

To see the generated config files, you need to 'log in' to the container by opening a bash inside it. To do so, run `sudo docker ps` and note the container name/id running the squerall-gui image. Then run:
```
sudo docker exec -it [container_ID/name] bash
```
Once in the bash, navigate to `cd /usr/local/squerall-gui/conf`, there you find `config` and `mappings.ttl` files.

## Contact
For any inquiries, please contact me on: mami@cs.uni-bonn.de, or ask directly on [Gitter chat](https://gitter.im/squerall).

License
-------

This project is openly available under the terms of the __Apache License
v2.0__ ([read for more](./LICENSE)).
