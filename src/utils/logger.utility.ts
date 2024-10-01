import { createLogger, format, transports } from 'winston';
const { combine, timestamp, printf, colorize } = format;

const logFormat = printf(({ level, message, timestamp }) => {
  const formattedMessage =
    typeof message === 'object' ? JSON.stringify(message, null, 2) : message;
  return `${timestamp} [${level}]: ${formattedMessage}`;
});
/**
 * Custom logger
 **/
const logger = createLogger({
  level: 'info',
  format: combine(timestamp()),
  transports: [
    new transports.Console({
      format: combine(
        colorize(),
        logFormat         
      ),
    }),
    new transports.File({
      filename: 'logs/app.log',
      format: logFormat
    }),
  ],
});

export default logger;
