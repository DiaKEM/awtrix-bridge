import { ConnectorInterface, Response } from './ConnectorInterface.js';
import { NightscoutConnector } from './NightscoutConnector.js';
import { DexcomConnector } from './DexcomConnector.js';
import { isString } from '../utils.js';

export class BGConnector implements ConnectorInterface {
  client: ConnectorInterface;

  constructor(
    private readonly type: string,
    private readonly nightScoutUrl?: string,
    private readonly nightScoutToken?: string,
    private readonly dexcomUsername?: string,
    private readonly dexcomPassword?: string,
    private readonly dexcomServer?: 'EU' | 'US',
    // @ts-expect-error will be used somewhen
    private readonly libreUsername?: string,
    // @ts-expect-error will be used somewhen
    private readonly librePassword?: string,
  ) {
    if (this.type === 'nightscout') {
      if (!isString(this.nightScoutToken) || !isString(this.nightScoutUrl)) {
        throw new Error('Please define nightscout url and token.');
      }
      this.client = new NightscoutConnector(
        this.nightScoutUrl,
        this.nightScoutToken,
      );
      return;
    }

    if (this.type === 'dexcom') {
      if (
        !isString(this.dexcomUsername) ||
        !isString(this.dexcomPassword) ||
        !isString(this.dexcomServer)
      ) {
        throw new Error('Please define dexcom credentials and server.');
      }
      this.client = new DexcomConnector(
        this.dexcomUsername,
        this.dexcomPassword,
        this.dexcomServer,
      );
      return;
    }

    if (this.type === 'libre') {
      // @todo
    }

    throw new Error(
      'Unable to build connector for given data. Check your .env variables and try again!',
    );
  }

  async getLatestValues(): Promise<Response> {
    return this.client.getLatestValues();
  }

  login(): boolean {
    return this.client.login();
  }
}
