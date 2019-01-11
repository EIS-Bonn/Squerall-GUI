package controllers

import javax.inject._
import play.api.Configuration
import com.typesafe.config.ConfigObject

import play.api.libs.functional.syntax._
import play.api.libs.json._
import play.api.mvc._
import play.api.Configuration

import scala.io.Source
import scala.collection.mutable

import java.io._
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.URI

import sys.process._

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class SquerallController @Inject()(cc: ControllerComponents, playconfiguration: Configuration) extends AbstractController(cc) {


  /**
   * Create an Action to render an HTML page with a welcome message.
   * The configuration in the `routes` file means that this method
   * will be called when the application receives a `GET` request with
   * a path of `/`.
   */
  def index = Action {
    Ok(views.html.squerall("Home", null))
  }

  def query = Action {
    Ok(views.html.squerall("Query", null))
  }

  def addSource = Action {
    Ok(views.html.squerall("Add source", null))
  }

  def addMappings = Action {

	val sourcesConfFile = playconfiguration.underlying.getString("sourcesConfFile")

	val data: String = Source.fromFile(sourcesConfFile).getLines.mkString
	val json: JsValue = Json.parse(data)

	case class SourceObject(dtype: String, entity: String)

	implicit val userReads: Reads[SourceObject] = (
		(__ \ 'type).read[String] and
        (__ \ 'entity).read[String]
    ) (SourceObject)

	var source_dtype : Map[String,String] = Map()

	val sources = (json \ "sources").as[Seq[SourceObject]]

	for (s <- sources) {
		source_dtype = source_dtype + (s.entity -> s.dtype)
	}

    Ok(views.html.squerall("Add mappings", source_dtype))
  }

  def annotate(entity: String) = Action {

	val sourcesConfFile = playconfiguration.underlying.getString("sourcesConfFile")

	val data: String = Source.fromFile(sourcesConfFile).getLines.mkString
	val json: JsValue = Json.parse(data)

	case class ConfigObject(dtype: String, source: String, options: Map[String,String], entity: String)

	implicit val userReads: Reads[ConfigObject] = (
		(__ \ 'type).read[String] and
        (__ \ 'source).read[String] and
        (__ \ 'options).read[Map[String,String]] and
        (__ \ 'entity).read[String]
    ) (ConfigObject)

	var optionsPerStar : mutable.HashMap[String, Map[String,String]] = mutable.HashMap()

	val sources = (json \ "sources").as[Seq[ConfigObject]]

	var source = ""
	var options : Map[String,String] = Map()
	var dtype = ""

	for (s <- sources) {
		if (s.entity == entity) {
			source = s.source
			options = s.options
			dtype = s.dtype

			optionsPerStar.put(source, options)
		}
	}

	var schema = ""
	var parquet_schema = ""
	var res = ""

	if (dtype == "csv") {
		if(source.contains("hdfs://")) {
			import org.apache.hadoop.conf.Configuration
			import org.apache.hadoop.fs.FSDataInputStream
			import org.apache.hadoop.fs.Path
			import org.apache.hadoop.hdfs.DistributedFileSystem

			var fileSystem = new DistributedFileSystem()
			var conf = new Configuration()
			fileSystem.initialize(new URI("hdfs://namenode-host:54310"), conf)
			var input = fileSystem.open(new Path(source))
			schema = (new BufferedReader(new InputStreamReader(input))).readLine()

		} else {
			val f = new File(source)
			schema = firstLine(f).get // in theory, we always have a header
		}

	} else if (dtype == "parquet") {

		// TODO: parquet-tool used is for local parquet files, look docs to how to build it for hdfs
        parquet_schema = "java -jar /media/mmami/Extra/Scala/Web/parquet-mr/parquet-tools/target/parquet-tools-1.9.0.jar schema " + source !!

        parquet_schema  = parquet_schema.substring(parquet_schema.indexOf('\n') + 1)

        var set = parquet_schema.split("\n").toSeq.map(_.trim).filter(_ != "}").map(f => f.split(" ")(2))

        for (s <- set) { schema = schema + "," + s.replace(";","") } // weirdly, there was a ; added from nowhere

        schema = schema.substring(1)
	} else if (dtype == "cassandra") {
		import com.datastax.driver.core._

		var table = (optionsPerStar.get(source)).get("table")
		var keyspace = (optionsPerStar.get(source)).get("keyspace")

		/*val hosts = Seq("127.0.0.1")
  		val Connector = ContactPoints(hosts).keySpace("whatever")*/

		var cluster : com.datastax.driver.core.Cluster = null;
		try {
			cluster = com.datastax.driver.core.Cluster.builder()
				    .addContactPoint("127.0.0.1")
				    .build()

			var session : com.datastax.driver.core.Session = cluster.connect()

			var rs : com.datastax.driver.core.ResultSet = session.execute("select column_name from system_schema.columns where keyspace_name = '" + keyspace + "' and table_name ='" + table + "'");
			var it = rs.iterator()
			while(it.hasNext()) {
				var row = it.next()
				schema = schema + row.getString("column_name") + ","
			}
		} finally {
			if (cluster != null) cluster.close();
		}
	} else if (dtype == "mongodb") {
		import com.mongodb.MongoClient

		var url = (optionsPerStar.get(source)).get("url")
		var db = (optionsPerStar.get(source)).get("database")
		var col = (optionsPerStar.get(source)).get("collection")

        val mongoClient = new MongoClient(url)
        val database = mongoClient.getDatabase(db)
        val collection = database.getCollection(col)

        val myDoc = collection.find.first
        println("collection: " + myDoc)

        var set = Set[String]()
        import scala.collection.JavaConverters._
        for (cur <- collection.find.limit(100).asScala) {
            for (x <- cur.asScala){
                set = set + x._1
            }
        }

		schema = set.mkString(",").replace("_id,","")
        mongoClient.close()
	} else if (dtype == "jdbc") { // TODO: specify later MySQL, SQL Server, etc.
		import java.sql.{Connection, DriverManager}

		val driver = (optionsPerStar.get(source)).get("driver")
		var url = (optionsPerStar.get(source)).get("url")
		var username = (optionsPerStar.get(source)).get("user")
		var password = (optionsPerStar.get(source)).get("password")
		var dbtable = (optionsPerStar.get(source)).get("dbtable")

        // there's probably a better way to do this
        var connection: Connection = null

        try {
            // make the connection
            Class.forName(driver)
            connection = DriverManager.getConnection(url, username, password)

            // create the statement, and run the select query
            val statement = connection.createStatement()
            val resultSet = statement.executeQuery("SHOW COLUMNS FROM " + dbtable)
            while ( resultSet.next() ) {
                val field = resultSet.getString("Field")
                schema = schema + field + ","
            }
        } catch {
            case e : Throwable => e.printStackTrace
        }

        connection.close()
		schema = omitLastChar(schema)
	}

	Ok(views.html.squerall1("Annotate source", source, options, dtype, schema, entity))
  }

	// helping methods
	def firstLine(f: java.io.File): Option[String] = {
		val src = Source.fromFile(f)
		try {
			src.getLines.find(_ => true)
	  	} finally {
			src.close()
	  	}
	}

	def omitLastChar(str: String): String = {
		var s = ""
		if (str != null && str.length() > 0) {
		    s = str.substring(0, str.length() - 1)
		}
		s
	}

}
