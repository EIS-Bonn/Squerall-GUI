package services

import javax.inject._
import play.api.Logger
import play.api.Configuration
import org.dizitart.no2.Nitrite

trait MappingsDB  {
  def connectDB () : Nitrite
  def getDB () : Nitrite
}

@Singleton
class MappingsDBInstance @Inject()(playconfiguration: Configuration) extends MappingsDB {
  Logger.info(s"MappingsDB: Starting a database connection.")

  var db : Nitrite = null

  override def connectDB () : Nitrite = {
    val mappingsDB = playconfiguration.underlying.getString("mappingsDB")
    if (db == null) {
      db = Nitrite.builder()
        .filePath(mappingsDB)
        .openOrCreate()
    }
    db
  }

  override def getDB () : Nitrite = {
    db
  }
}
