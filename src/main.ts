import { exit } from 'node:process';
import { configDotenv } from 'dotenv';
import {
  getMqttConnector,
  isString,
  showBloodSugar,
  showDifference,
  showElapsedTime,
  sleep,
} from './utils.js';
import { BGConnector } from './connector/BGConnector.js';

configDotenv({});

const pageSleeper = (): Promise<void> =>
  sleep(parseInt(process.env.DBIXEL_PAGE_TIMER as string) || 5000);
(async function (): Promise<void> {
  const {
    MQTT_BASE_TOPIC,
    BG_SOURCE,
    NIGHTSCOUT_URL,
    NIGHTSCOUT_API_SECRET,
    DEXCOM_USERNAME,
    DEXCOM_PASSWORD,
    DEXCOM_SERVER,
    LIBRE_USERNAME,
    LIBRE_PASSWORD,
    MQTT_URL,
    MQTT_USERNAME,
    MQTT_PASSWORD,
    MQTT_CONNECTION_TIMEOUT,
    MQTT_RECONNECT_PERIOD,
  } = process.env;
  console.log('diyabixel app v0.1');
  console.log('Configuration:');
  console.table({
    MQTT_BASE_TOPIC,
    BG_SOURCE,
    NIGHTSCOUT_URL,
    NIGHTSCOUT_API_SECRET,
    DEXCOM_USERNAME,
    DEXCOM_PASSWORD,
    DEXCOM_SERVER,
    LIBRE_USERNAME,
    LIBRE_PASSWORD,
  });
  console.log('Setting up MQTT connection...');

  if (
    !isString(MQTT_USERNAME) ||
    !isString(MQTT_PASSWORD) ||
    !isString(MQTT_URL) ||
    !isString(MQTT_BASE_TOPIC) ||
    !isString(MQTT_CONNECTION_TIMEOUT) ||
    !isString(MQTT_RECONNECT_PERIOD)
  ) {
    throw new Error('Please define all mqtt configuration parameters.');
  }
  const mqttConnector = getMqttConnector(
    MQTT_URL,
    MQTT_USERNAME,
    MQTT_PASSWORD,
    MQTT_BASE_TOPIC,
    parseInt(MQTT_CONNECTION_TIMEOUT),
    parseInt(MQTT_RECONNECT_PERIOD),
  );

  if (!(await mqttConnector.connect())) {
    console.log('mqtt connection failed.');
    exit(1);
  }
  console.log('mqtt connected!');

  if (!isString(BG_SOURCE)) {
    throw new Error('Please define BG_SOURCE env variable.');
  }

  const bgConnector = new BGConnector(
    BG_SOURCE,
    NIGHTSCOUT_URL,
    NIGHTSCOUT_API_SECRET,
    DEXCOM_USERNAME,
    DEXCOM_PASSWORD,
    DEXCOM_SERVER as 'EU' | 'US',
    LIBRE_USERNAME,
    LIBRE_PASSWORD,
  );

  console.log('Setting up bg connection...');
  if (!(await bgConnector.login())) {
    console.log('bg connection failed.');
    exit(1);
  }

  console.log('bg source connected!');
  const mqttTopic = process.env.MQTT_TOPIC;

  if (!mqttTopic) {
    console.log('No MQTT_TOPIC WAS SET!');
    exit(1);
  }

  while (true) {
    try {
      mqttConnector.send('switch', JSON.stringify({ name: 'diyabixel' }));
      console.log('Get bg values...');
      const bgData = await bgConnector.getLatestValues();
      console.log('Show blood sugar...');
      await showBloodSugar(mqttConnector, mqttTopic, bgData);
      await pageSleeper();
      console.log('Show difference...');
      await showDifference(mqttConnector, mqttTopic, bgData);
      await pageSleeper();
      console.log('Show elapsed time ...');
      await showElapsedTime(mqttConnector, mqttTopic, bgData);
      await pageSleeper();
    } catch (e) {
      console.error(e);
    }
  }
})();
