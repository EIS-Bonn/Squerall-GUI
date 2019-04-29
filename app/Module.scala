import com.google.inject.AbstractModule

import services.{MappingsDBInstance, MappingsDB, CloseDB}

/**
 * This class is a Guice module that tells Guice how to bind several
 * different types. This Guice module is created when the Play
 * application starts.
 */
class Module extends AbstractModule {

  override def configure() = {
    bind(classOf[MappingsDB]).to(classOf[MappingsDBInstance])
    bind(classOf[CloseDB]).asEagerSingleton()
  }

}
