package controllers
import javax.inject._
import play.api.mvc._
import org.dizitart.no2.Nitrite
import org.dizitart.no2.NitriteId
import org.dizitart.no2.Document
import org.dizitart.no2.NitriteCollection
import services.MappingsDB


@Singleton
class MappingsController @Inject() (cc: ControllerComponents, database: MappingsDB) extends AbstractController(cc) {
                                
  def insert = Action(parse.tolerantFormUrlEncoded) {

    val db : Nitrite = database.connectDB
    
		var collection : NitriteCollection = db.getCollection("mappings")
		var doc = Document.createDocument("entity", 4)
			.put("source", 1)
			.put("ID", 2)
			.put("class", 3)

    collection.insert(doc)

    Ok("Document added") 
  }
}
