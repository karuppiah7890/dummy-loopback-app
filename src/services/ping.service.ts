import {BindingScope, inject, injectable} from '@loopback/core';
import {LoggingBindings, WinstonLogger} from '@loopback/logging';

@injectable({ scope: BindingScope.TRANSIENT })
export class PingService {
  // Inject a winston logger
  @inject(LoggingBindings.WINSTON_LOGGER)
  private logger: WinstonLogger;

  ping() {
    this.logger.info("ping service method successful!")
  }
}
