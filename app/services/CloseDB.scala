package services

import java.time.{Clock, Instant}
import javax.inject._
import play.api.Logger
import play.api.inject.ApplicationLifecycle
import scala.concurrent.Future
import org.dizitart.no2.Nitrite
import services.MappingsDB

@Singleton
class CloseDB @Inject() (database: MappingsDB, appLifecycle: ApplicationLifecycle) {

  appLifecycle.addStopHook { () =>
    val db : Nitrite = database.getDB
    Logger.info(s"CloseDB: closing database connection.")
    if (!db.isClosed())
      db.close()
    Future.successful()
  }
}
