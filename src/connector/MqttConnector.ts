import mqtt, { MqttClient, Packet } from 'mqtt';

export class MqttConnector {
  client: MqttClient;
  constructor(
    private readonly url: string,
    private readonly username: string,
    private readonly password: string,
    private readonly baseTopic: string,
    private readonly connectionTimeout: number,
    private readonly reconnectPeriod: number,) {
  }

  async connect(): Promise<boolean> {
    try {
      this.client = await mqtt.connectAsync(this.url, {
        username: this.username,
        password: this.password,
        connectTimeout: this.connectionTimeout,
        reconnectPeriod: this.reconnectPeriod,
        clientId: `mqtt_${Math.random().toString(16).slice(3)}`,
        clean: true
      })
    } catch (e) {
      console.error(e);
      return false;
    }

    return true;
  }

  async send(topic, payload): Promise<Packet | undefined> {
    console.log('--------------------------------------------');
    console.log(`MQTT-TOPIC: ${this.baseTopic}/${topic}`)
    console.log(`Payload:`)
    console.table(JSON.parse(payload));
    console.log('--------------------------------------------');
    return await this.client.publishAsync(`${this.baseTopic}/${topic}`, payload);
  }
}
