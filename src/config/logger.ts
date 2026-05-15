import * as appInsights from 'applicationinsights';
import winston from 'winston';

import { env } from './env';

appInsights
  .setup(env.APPINSIGHTS_CONNECTION_STRING)
  .setSendLiveMetrics(true)
  .setAutoCollectConsole(false)
  .start();

const aiClient = appInsights.defaultClient;
const appInsightsTransport = new winston.transports.Console({
  format: winston.format.printf(({ level, message, timestamp }) => {
    const output = `[${level} ${message} ${timestamp}]`;

    aiClient.trackTrace({
      message: output,
      properties: { timestamp },
    });

    return output;
  }),
});

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [new winston.transports.Console(), appInsightsTransport],
});
