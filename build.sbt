name := """Squerall-GUI"""

version := "0.2.0"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

resolvers += Resolver.sonatypeRepo("snapshots")

scalaVersion := "2.12.2"

libraryDependencies += guice

// https://mvnrepository.com/artifact/org.dizitart/nitrite
libraryDependencies += "org.dizitart" % "nitrite" % "3.0.2"

// https://mvnrepository.com/artifact/org.apache.hadoop/hadoop-common
libraryDependencies += "org.apache.hadoop" % "hadoop-common" % "3.2.0"

// https://mvnrepository.com/artifact/org.apache.hadoop/hadoop-core
libraryDependencies += "org.apache.hadoop" % "hadoop-core" % "1.2.0"

// http://repo1.maven.org/maven2/com/outworkers/phantom-dsl_2.12/2.15.5/
//libraryDependencies += "com.outworkers" % "phantom-dsl_2.12" % "2.15.5"

// https://mvnrepository.com/artifact/com.outworkers/phantom-dsl
libraryDependencies += "com.outworkers" %% "phantom-dsl" % "2.41.0"

// https://mvnrepository.com/artifact/com.datastax.cassandra/cassandra-driver-core
libraryDependencies += "com.datastax.cassandra" % "cassandra-driver-core" % "3.3.1"
//libraryDependencies += "com.datastax.oss" % "java-driver-core" % "4.0.1"

// https://mvnrepository.com/artifact/org.mongodb/mongo-java-driver
libraryDependencies += "org.mongodb" % "mongo-java-driver" % "3.10.2"

// https://mvnrepository.com/artifact/mysql/mysql-connector-java
libraryDependencies += "mysql" % "mysql-connector-java" % "8.0.15"

libraryDependencies += "org.apache.jena" % "jena-core" % "3.10.0"
libraryDependencies += "org.apache.jena" % "jena-arq" % "3.10.0"

