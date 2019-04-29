package services

import javax.inject._
//import play.api.inject.ApplicationLifecycle

import play.api.Logger

import org.dizitart.no2.Nitrite

import scala.concurrent.Future

trait MappingsDB  {
  def connectDB () : Nitrite
  def getDB () : Nitrite
}

@Singleton
//class MappingsDBInstance @Inject() (appLifecycle: ApplicationLifecycle)  extends MappingsDB {
class MappingsDBInstance @Inject() extends MappingsDB {
  Logger.info(s"MappingsDB: Starting a database connection.")

  var db : Nitrite = null

  override def connectDB () : Nitrite = {
    if (db == null) {
      db = Nitrite.builder()
        .filePath("/home/mmami/Data/mappingsDB.db")
        .openOrCreate()
    }
    db
  }

  override def getDB () : Nitrite = {
    db
  }

  /*appLifecycle.addStopHook { () =>
    Logger.info(s"CloseDB: closing database connection.")
    db.commit()
    Future.successful(db.close())
  }*/
  
}
