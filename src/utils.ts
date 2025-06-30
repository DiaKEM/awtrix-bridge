import { MqttConnector } from './connector/MqttConnector.js';
import { Response } from './connector/ConnectorInterface.js';
import { Packet } from 'mqtt';

export const sleep = (time: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, time));

export const getMqttConnector = (
  url: string,
  username: string,
  password: string,
  baseTopic: string,
  connectionTimeout: number,
  reconnectPeriod: number,
): MqttConnector =>
  new MqttConnector(
    url,
    username,
    password,
    baseTopic,
    connectionTimeout,
    reconnectPeriod,
  );

export const showBloodSugar = async (
  client: MqttConnector,
  topic: string,
  bgValues: Response,
): Promise<Packet | undefined> => {
  return await client.send(
    topic,
    JSON.stringify({
      text: `${bgValues.latest.value}`,
      duration: 999999,
      icon: bgValues.latest.tendency || 'unknown',
      ...getProgressBar(bgValues),
    }),
  );
};

export const showDifference = async (
  client: MqttConnector,
  topic: string,
  bgValues: Response,
): Promise<Packet | undefined> => {
  const difference = bgValues.latest.value - bgValues.previous.value;
  const changeIndicator = difference > 0 ? '+' : difference === 0 ? '+/-' : '';
  return await client.send(
    topic,
    JSON.stringify({
      text: `${changeIndicator}${difference}`,
      duration: 999999,
      icon: 'diff',
      ...getProgressBar(bgValues),
    }),
  );
};

const millisToMinutesAndSeconds = (millis: number): string => {
  const minutes = Math.floor(millis / 60000);
  const seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ':' + seconds + (parseInt(seconds) < 10 ? '0' : '');
};

export const showElapsedTime = async (
  client: MqttConnector,
  topic: string,
  bgValues: Response,
): Promise<Packet | undefined> => {
  const timeDifference = millisToMinutesAndSeconds(
    Date.now() - bgValues.latest.timestamp,
  );
  return await client.send(
    topic,
    JSON.stringify({
      text: `${timeDifference}`.replace('.', ':'),
      duration: 999999,
      icon: 'clock',
      ...getProgressBar(bgValues),
    }),
  );
};

export const getTimeGap = (bgValues: Response): number =>
  (bgValues.latest.timestamp - bgValues.previous.timestamp) / 1000 < 120
    ? 90
    : 300;
export const getTimeDifference = (bgValues: Response): number =>
  (Date.now() - bgValues.latest.timestamp) / 1000;
export const getTimeProgress = (bgValues: Response): number =>
  Math.ceil((100 / getTimeGap(bgValues)) * getTimeDifference(bgValues));
export const getProgressBar = (
  bgValues: Response,
): {
  progressBC: string;
  progressC: string;
  progress: number;
} => {
  const progress = getTimeProgress(bgValues);

  return {
    progressBC: '#ffffff',
    progressC:
      progress > 100 ? '#d12a2a' : progress > 50 ? '#ffbb00' : '#1fed26',
    progress,
  };
};

export const isString = (a: unknown): a is string => typeof a === 'string';
export const isNumber = (a: unknown): a is number =>
  typeof a === 'number' && !isNaN(a);
export const isBoolean = (a: unknown): a is boolean => typeof a === 'boolean';
