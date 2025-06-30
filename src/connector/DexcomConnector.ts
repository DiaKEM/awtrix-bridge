import {
  ConnectorInterface,
  Response,
  Tendency,
  TendencyType,
} from './ConnectorInterface.js';
import { DexcomApiClient } from '@diakem/dexcom-api-client';

export class DexcomConnector implements ConnectorInterface {
  private client;
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
    private readonly username: string,
    private readonly password: string,
    private readonly server: 'EU' | 'US',
  ) {
    this.client = DexcomApiClient({
      username: this.username,
      password: this.password,
      server: this.server,
      debug: false,
    });
  }

  async getLatestValues(): Promise<Response> {
    const response = await this.client.read(undefined, 2);

    return {
      latest: {
        value: response[0].value,
        timestamp: response[0].date.getTime(),
        tendency: this.arrows[response[0].trend] || Tendency.unknown,
      },
      previous: {
        value: response[1].value,
        timestamp: response[1].date.getTime(),
        tendency: this.arrows[response[1].trend] || Tendency.unknown,
      },
    };
  }

  login(): boolean {
    // @todo implement this
    return true;
  }
}
