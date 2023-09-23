import {BindingScope, inject, injectable} from '@loopback/core';
import {LoggingService} from './logging.service';

@injectable({ scope: BindingScope.SINGLETON })
export class PingService {
  @inject("services.LoggingService")
  private logger: LoggingService;

  ping() {
    this.logger.info("ping service method successful!")
  }
}
