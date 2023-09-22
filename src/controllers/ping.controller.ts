import {inject} from '@loopback/core';
import {LoggingBindings, WinstonLogger} from '@loopback/logging';
import {
  Request,
  ResponseObject,
  RestBindings,
  get,
  response,
} from '@loopback/rest';
import {PingService} from '../services';

/**
 * OpenAPI response for ping()
 */
const PING_RESPONSE: ResponseObject = {
  description: 'Ping Response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        title: 'PingResponse',
        properties: {
          greeting: {type: 'string'},
          date: {type: 'string'},
          url: {type: 'string'},
          headers: {
            type: 'object',
            properties: {
              'Content-Type': {type: 'string'},
            },
            additionalProperties: true,
          },
        },
      },
    },
  },
};

/**
 * A simple controller to bounce back http requests
 */
export class PingController {
  pingService: PingService;

  // Inject a winston logger
  @inject(LoggingBindings.WINSTON_LOGGER)
  private logger: WinstonLogger;

  constructor(
    @inject(RestBindings.Http.REQUEST) private req: Request,
    @inject("services.PingService") pingService: PingService) {
      this.pingService = pingService
    }

  // Map to `GET /ping`
  @get('/ping')
  @response(200, PING_RESPONSE)
  ping(): object {
    this.pingService.ping()
    this.logger.info("ping controller method successful!")
    // Reply with a greeting, the current time, the url, and request headers
    return {
      greeting: 'Hello from LoopBack',
      date: new Date(),
      url: this.req.url,
      headers: Object.assign({}, this.req.headers),
    };
  }
}
