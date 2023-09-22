import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, extensionFor} from '@loopback/core';
import {LoggingBindings, LoggingComponent, WINSTON_FORMAT, WINSTON_TRANSPORT, WinstonTransports} from '@loopback/logging';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import config from "config";
import path from 'path';
import {format} from 'winston';
import DailyRotateFile, {
  DailyRotateFileTransportOptions,
} from "winston-daily-rotate-file";
import {MySequence} from './sequence';

export {ApplicationConfig};

const APPLICATION_LOG_PATH = config.get<string>("log.application_log_dir");
const APPLICATION_LOG_FILENAME = config.get<string>(
  "log.application_log_filename"
);
const APPLICATION_LOG_ROTATE_FILE_FORMAT = config.get<string>(
  "log.application_log_rotate_file_format"
);

export class DummyLoopbackAppApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    // WINSTON CONFIGURATION

    this.configure(LoggingBindings.COMPONENT).to({
      enableFluent: false, // default to true
      enableHttpAccessLog: true, // default to true
    })

    this.bind("logging.winston.formats.colorize")
      .to(format.colorize())
      .apply(extensionFor(WINSTON_FORMAT));

    // If we're not in production then log to the `console` with the format:
    // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
    //
    if (process.env.NODE_ENV !== "production") {
      const consoleTransport = new WinstonTransports.Console({
        level: "debug",
        format: format.combine(format.simple()),
      });
      this.bind("logging.winston.transports.console")
        .to(consoleTransport)
        .apply(extensionFor(WINSTON_TRANSPORT));
    }

    // Append logs to log file and configure log rotate and zipping
    const fileTransport = new DailyRotateFile({
      level: "debug",
      format: format.json(),
      filename: APPLICATION_LOG_ROTATE_FILE_FORMAT,
      dirname: APPLICATION_LOG_PATH,
      createSymlink: true,
      symlinkName: APPLICATION_LOG_FILENAME,
      maxSize: "100m",
      zippedArchive: true,
      maxFiles: "25",
      // stream: undefined
    } as DailyRotateFileTransportOptions);
    this.bind("logging.winston.transports.file")
      .to(fileTransport)
      .apply(extensionFor(WINSTON_TRANSPORT));

    // Configure morgan options for access logging
    this.configure(LoggingBindings.WINSTON_HTTP_ACCESS_LOGGER).to({
      format: `:remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :response-time ms :res[content-length] ":referrer" ":user-agent"`,
    });

    this.component(LoggingComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
}
