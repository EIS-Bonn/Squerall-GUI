[![Gitter](https://img.shields.io/gitter/room/DAVFoundation/DAV-Contributors.svg?style=flat-square)](https://gitter.im/Squerall)

# Squerall-GUI
Squerall-GUI is the user interface of [Squerall](https://github.com/EIS-Bonn/Squerall), which is a solution for querying Data Lakes in a unified manner. Squerall-GUI produces three input files used by Squerall. Squerall-GUI is a Scala Play Web application run using SBT.

## Execution
To build and run the Squerall-GUI, simply run:
`sbt compile` then
`sbt run` (or directly `sbt run`).

Then open your browser and navigate to `localhost:9000/Squerall`.

## Usage
Squerall-GUI consits of three interfaces:
- **1. Source injestion:** add a source by setting values to a set of prelisted options, mostly used by Spark.
- **2. Source mapping:** map data entities and attributes to Ontology classes and predicates.
- **3. Query:** query the data using Ontology terms frop the mappings built by 2.

Each of the previous interfaces outputs a file that is used by Squerall:

1. Data source access configurations are saved in: `conf/config`
2. Mappings are saved in: `conf/mappings.ttl`
3. Query is saved in `conf/query.sparql`

You can change the path to these files in `cong/application.conf`.

For more information, refer to the paper here: ["Teach me to fish" Querying Semantic Data Lakes](https://www.researchgate.net/publication/322526357_%27Teach_me_to_fish%27_Querying_Semantic_Data_Lakes)

Screencasts of Squerall GUIs: https://drive.google.com/drive/folders/10mkwMrbuxv71gtwE2etDzqANt8S9YXhr

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
Once in the bash, navigate to `cd /usr/local/squerall/conf`, there you find `config` and `mappings.ttl` files.

## Contact
For more enquireis, contact me on: mami@cs.uni-bonn.de, or ask directly on [Gitter chat](https://gitter.im/squerall).

License
-------

This project is openly shared under the terms of the __Apache License
v2.0__ ([read for more](./LICENSE)).
