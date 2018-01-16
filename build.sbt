name := """play-scala-starter-example"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

resolvers += Resolver.sonatypeRepo("snapshots")

scalaVersion := "2.12.2"

libraryDependencies += guice
libraryDependencies += "org.scalatestplus.play" %% "scalatestplus-play" % "3.1.2" % Test
libraryDependencies += "com.h2database" % "h2" % "1.4.196"

// https://mvnrepository.com/artifact/org.apache.hadoop/hadoop-common
libraryDependencies += "org.apache.hadoop" % "hadoop-common" % "2.8.2"

// https://mvnrepository.com/artifact/org.apache.hadoop/hadoop-core
libraryDependencies += "org.apache.hadoop" % "hadoop-core" % "0.20.2"

// http://repo1.maven.org/maven2/com/outworkers/phantom-dsl_2.12/2.15.5/
libraryDependencies += "com.outworkers" % "phantom-dsl_2.12" % "2.15.5"

// https://mvnrepository.com/artifact/com.datastax.cassandra/cassandra-driver-core
libraryDependencies += "com.datastax.cassandra" % "cassandra-driver-core" % "3.3.1"

// https://mvnrepository.com/artifact/org.mongodb/mongo-java-driver
libraryDependencies += "org.mongodb" % "mongo-java-driver" % "3.5.0"

// https://mvnrepository.com/artifact/mysql/mysql-connector-java
libraryDependencies += "mysql" % "mysql-connector-java" % "6.0.6"

libraryDependencies += "org.apache.jena" % "jena-core" % "3.1.1"
libraryDependencies += "org.apache.jena" % "jena-arq" % "3.1.1"
