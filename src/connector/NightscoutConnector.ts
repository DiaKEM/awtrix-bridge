import axios, { Axios } from 'axios';
import {
  ConnectorInterface,
  Response,
  Tendency,
  TendencyType,
} from './ConnectorInterface.js';

export class NightscoutConnector implements ConnectorInterface {
  private client: Axios;
  private arrows: Record<string, TendencyType> = {
    Flat: 'flat',
    SingleUp: 'up',
    DoubleUp: 'doubleUp',
    FortyFiveUp: 'fortyfiveUp',
    SingleDown: 'down',
    DoubleDown: 'doubleDown',
    FortyFiveDown: 'fortyfiveDown',
  };
  constructor(
    private readonly url: string,
    private readonly apiSecret: string,
  ) {
    this.client = axios.create({
      baseURL: this.url,
      timeout: 10000,
      headers: {
        'API-SECRET': this.apiSecret,
      },
    });
  }

  async getLatestValues(): Promise<Response> {
    const response = await this.client.get('/api/v1/entries.json');
    return {
      latest: {
        value: response.data[0].sgv,
        timestamp: response.data[0].date,
        tendency: this.arrows[response.data[0].direction] || Tendency.unknown,
      },
      previous: {
        value: response.data[1].sgv,
        timestamp: response.data[1].date,
        tendency: this.arrows[response.data[1].direction] || Tendency.unknown,
      },
    };
  }

  login(): boolean {
    return true;
  }
}
