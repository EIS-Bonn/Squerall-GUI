package controllers

import javax.inject._
import play.api.mvc._
import play.api.mvc._
import play.api.libs.json._
import play.api.libs.functional.syntax._
import play.api.Configuration
import scala.io.Source
import java.io._

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class AjaxController @Inject()(cc: ControllerComponents, playconfiguration: Configuration) extends AbstractController(cc) {

  /**
   * Create an Action to render an HTML page with a welcome message.
   * The configuration in the `routes` file means that this method
   * will be called when the application receives a `GET` request with
   * a path of `/`.
   */
  def index = Action {
    Ok(views.html.index("Your new application is ready."))
  }

  /*def ajax = Action { implicit request =>
    Ok("Got request [" + request + "]")
  }*/

  def getEmptyOptions = Action(parse.tolerantFormUrlEncoded) { 
	request => val paramVal : String = request.body.get("dataType").map(_.head).getOrElse("").toString // javalangstring
  
	val response = Json.stringify(getOptions(paramVal))

	Ok(response)
  }

  def setOptions = Action(parse.tolerantFormUrlEncoded) {
	request => var options : String = request.body.get("options").map(_.head).getOrElse("").toString // javalangstring	
			   var srcType : String = request.body.get("srcType").map(_.head).getOrElse("").toString // javalangstring	

	var srcOptsToAppend = ""
	var new_lines : List[String] = null
	val sourcesConfFile = playconfiguration.underlying.getString("sourcesConfFile")

	var lines_list = Source.fromFile(sourcesConfFile).getLines().toList
	var commaOrnNot = ""
	if(lines_list.isEmpty)
		srcOptsToAppend = srcOptsToAppend + "{\n\t\"sources\": [\n"
	else { 
		lines_list = lines_list.dropRight(2) // Delete last 2 lines "] \n }"
		commaOrnNot = "\t,"
	}

	//new_lines = lines_list

	val pw = new PrintWriter(new File(sourcesConfFile)) 
	lines_list.foreach(l => pw.write(l + "\n"))

	// To open the end of the file to new entry
	options = omit(options,"[[")
	options = omit(options,"]]")
	var optionsBits = options.split("\\],\\[")

	srcOptsToAppend = srcOptsToAppend + commaOrnNot + "\t{"	
	srcOptsToAppend = srcOptsToAppend + "\n\t\t\"type\": \"" + srcType + "\","

	srcOptsToAppend = srcOptsToAppend + "\n\t\t\"options\": {"

	var mapp : Map[String, String] = Map()
	var src = ""
	var entity = ""
	var pathFound = false // To defrentiate between file-based sources (eg. CSV/Paruqet) and db based (eg. MongoDB, Cassandra)
	for (kv <- 0 to optionsBits.length - 1) {
		var kvbits = optionsBits(kv).split(",", 2) // TODO: carefull where , used as csv delimiter 
		//var optValue = (kvbits(0) -> kvbits(1))
		if (kvbits(0) == "\"path\"") { // move out of the options
			src = kvbits(1)
			pathFound = true		
		} else if (kvbits(0) == "\"entity\"") // move out of the options
			entity = kvbits(1)
		else {
			srcOptsToAppend = srcOptsToAppend + "\n\t\t\t" + kvbits(0) + ": " + kvbits(1)

			if(kv < optionsBits.length - 1)
				srcOptsToAppend = srcOptsToAppend + ","
			}
		}

	srcOptsToAppend = srcOptsToAppend + "\n\t\t},"
	if (pathFound)
		srcOptsToAppend = srcOptsToAppend + "\n\t\t\"source\": " + src + ","
	else
		srcOptsToAppend = srcOptsToAppend + "\n\t\t\"source\": " + entity.replaceFirst("\"","\"//") + "," // When it's not a file, source will be: "//[Entity]" just a randomly-selecte template, can change in the future
	srcOptsToAppend = srcOptsToAppend + "\n\t\t\"entity\": " + entity	
	srcOptsToAppend = srcOptsToAppend + "\n\t}"

	pw.write(srcOptsToAppend)
    
	pw.write("\n\t]\n}") // put back the two lines
	pw.close()

	Ok(srcOptsToAppend)
  }

  def newMappings = Action(parse.tolerantFormUrlEncoded) { 
	request => var mappings : String = request.body.get("mappings").map(_.head).getOrElse("").toString // javalangstring	
			   var pk : String = request.body.get("pk").map(_.head).getOrElse("").toString 
			   var clss : String = request.body.get("clss").map(_.head).getOrElse("").toString 
			   var shortns_clss : String = request.body.get("shortns_clss").map(_.head).getOrElse("").toString 
			   var ns_clss : String = request.body.get("ns_clss").map(_.head).getOrElse("").toString 
			   var entity : String = request.body.get("entity").map(_.head).getOrElse("").toString 
			   var src : String = request.body.get("src").map(_.head).getOrElse("").toString 
			   var dtype : String = request.body.get("dtype").map(_.head).getOrElse("").toString
	
	pk = pk.replace("\"","")

	var mp = JSONstringToMap(mappings)

	var rml = "\n<#" + entity + "Mapping>"
	rml = rml + "\n\trml:logicalSource ["
	rml = rml + "\n\t\trml:source \"" + src + "\";"; // eg. hdfs://localhost:9000/thesis/insurance_test.csv
    //rml = rml + "\n\t\trml:referenceFormulation ql:" + dtype; // Omitted for now
	rml = rml + "\n\t\tnosql:Store nosql:" + dtype;
    rml = rml + "\n\t];"

	rml = rml + "\n\trr:subjectMap ["
	rml = rml + "\n\t\trr:template \"http://example.com/{" + pk + "}\";"
	rml = rml + "\n\t\trr:class " + shortns_clss + ":" + clss.replace(ns_clss,"")
    rml = rml + "\n\t];\n"

	var prolog = ""
	prolog = prolog + "@prefix " + shortns_clss + ": <" + ns_clss + ">\n"

	var i = 0
	for((k,v) <- mp) {	
		if (pk != k.replace("\"","")) {
			val vbits = v.replace("\"","").split("___") // eg. gd___http://purl.org/goodrelations/v1#legalName
			val short_ns = vbits(0) // eg. gd
			val pred_url = vbits(1) // eg. http://purl.org/goodrelations/v1#legalName
			val pred_urlbits = v.replace("#","/").split("/") 
			val pred = pred_urlbits(pred_urlbits.length-1).replace("\"","") // eg. legalName
			val ns = pred_url.replace(pred,"") // eg. http://purl.org/goodrelations/v1#
		
			rml = rml + "\n\trr:predicateObjectMap ["
			rml = rml + "\n\t\trr:predicate " + short_ns + ":" + pred + ";"
			rml = rml + "\n\t\trr:objectMap [rml:reference " + k + "]"	 		
			
			i = i + 1
			rml = if(i < mp.size - 1) rml + "\n\t];\n" else rml + "\n\t].\n"
	
			prolog = prolog + "@prefix " + short_ns.replace("\"","") + ": <" + ns + ">\n"
		}
	}

	val mappingsFile = playconfiguration.underlying.getString("mappingsFile")

	val lines_list = Source.fromFile(mappingsFile).getLines().toList
	if(lines_list.isEmpty) { // First time to insert a mapping
		prolog = prolog + "@prefix rr: <http://www.w3.org/ns/r2rml#>\n"
		prolog = prolog + "@prefix rml: <http://semweb.mmlab.be/ns/rml#>\n"
		prolog = prolog + "@prefix nosql: <http://purle.org/db/mysql#>\n"
		// prolog = prolog + "@prefix ql: <http://semweb.mmlab.be/ns/ql#>\n" // for later
	}
	val pw = new PrintWriter(new File(mappingsFile)) 

	pw.write(prolog) // add prolog to the top of the file, the rest to the bottom
	lines_list.foreach(l => pw.write(l + "\n"))
	pw.write(rml)
	
	pw.close()
	Ok(rml)
  }
	
  def getPredicates(p: String, has: Option[String]) = Action {

	import org.apache.jena.query.{QueryExecutionFactory, QueryFactory}
	import org.apache.jena.rdf.model.ModelFactory
	import org.apache.jena.util.FileManager
	import scala.collection.mutable.Set

	var getPredicatesQuery  = ""
	if(has.isDefined) {

		val value: String = has match {
		  case None => ""//Or handle the lack of a value another way: throw an error, etc.
		  case Some(s: String) => s //return the string to set your value
		}

		getPredicatesQuery = "PREFIX rml: <http://semweb.mmlab.be/ns/rml#> " +
		"PREFIX rr: <http://www.w3.org/ns/r2rml#>" +
		"SELECT ?p WHERE {" +
			"?map rr:predicateObjectMap ?pom . " +
			"?pom rr:predicate ?p . " +
			"?map rr:predicateObjectMap ?pom1 . " +
			"?pom1 rr:predicate <" + value + "> . " +
			"FILTER(regex(str(?p), \"" + p + "\")) . " +			
		"}"
		
	} else {
		getPredicatesQuery = "PREFIX rml: <http://semweb.mmlab.be/ns/rml#> " +
		"PREFIX rr: <http://www.w3.org/ns/r2rml#>" +
		"SELECT ?p WHERE {" +
			"?pom rr:predicate ?p . " +
			"FILTER(regex(str(?p), \"" + p + "\")) ." +
		"}"
	}
	
	var query = QueryFactory.create(getPredicatesQuery)

	val mappingsFile = playconfiguration.underlying.getString("mappingsFile")
 	var in = FileManager.get().open(mappingsFile)
    if (in == null) {
        throw new IllegalArgumentException("File: " + mappingsFile + " not found")
    }

	var model = ModelFactory.createDefaultModel()
    model.read(in, null, "TURTLE")

	val pred: Set[String] = Set()
	
	var qe = QueryExecutionFactory.create(query, model)
	var results = qe.execSelect()
	while (results.hasNext) {
		var soln = results.nextSolution()
		var p = soln.get("p").toString
		pred.add(p)
	}

	Ok(Json.stringify(Json.toJson(pred)))
	//Ok(has.mkString)
  }

// Helping methods
  def JSONstringToMap(mapString: String) : Map[String,String] = {
	var newString = omit(mapString,"[[")
	newString = omit(newString,"]]")

	var keyValueBits = newString.split("\\],\\[")
	var newMap : Map[String,String] = Map()

	for(kv <- keyValueBits) {
		val kvbits = kv.split(",")
		val k = kvbits(0)
		val v = kvbits(1)
		newMap = newMap + (k -> v)
	}

	return newMap
  }

  def getOptions(choice: Any): JsObject = choice match {
      case "csv" =>
		Json.obj("path" -> Json.arr("","Location of the file"), "header" -> Json.arr("true", "false","Specify whether to consider the text header or add a personalized header"), "delimiter" -> Json.arr("","Delimiter of the columns"), "mode" ->  Json.arr("PERMISSIVE", "DROPMALFORMED", "FAILFAST","Dealing with corrupt records during parsing"))
	  case "parquet" => 
		Json.obj("path" -> Json.arr("","Location of the file"), "spark_sql_parquet_filterPushdown" -> Json.arr("true", "false","Enables Parquet filter push-down optimization when set to true."))
	  case "mongodb" =>
		Json.obj("url" -> Json.arr("",""), "database" -> Json.arr("",""), "collection" -> Json.arr("",""))
	  case "cassandra" => 
		Json.obj("keyspace" -> Json.arr("",""), "table" -> Json.arr("",""))
	  case "jdbc" =>
		Json.obj("url" -> Json.arr("",""), "driver" -> Json.arr("",""), "dbtable" -> Json.arr("",""), "user" -> Json.arr("",""), "password" -> Json.arr("",""))
	  case _ => 
		Json.obj("more" -> "to come")
  }

  def omit(str: String, omt: String) : String = {
    return str.replace(omt, "")
  }

}
