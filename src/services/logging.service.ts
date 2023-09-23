import {BindingScope, inject, injectable} from '@loopback/core';
import {LoggingBindings, WinstonLogger} from '@loopback/logging';

@injectable({ scope: BindingScope.SINGLETON })
export class LoggingService {
  // Inject a winston logger
  @inject(LoggingBindings.WINSTON_LOGGER)
  private logger: WinstonLogger;

  info(message: string) {
    this.logger.info(message)
  }
}
