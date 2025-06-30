export const Tendency = {
  flat: 'flat',
  up: 'up',
  doubleUp: 'doubleUp',
  down: 'down',
  doubleDown: 'doubleDown',
  fortyfiveDown: 'fortyfiveDown',
  fortyfiveUp: 'fortyfiveUp',
  unknown: 'unknown',
} as const;

export type TendencyKeys = keyof typeof Tendency;
export type TendencyType = (typeof Tendency)[TendencyKeys];
export type BloodSugarData = {
  value: number;
  timestamp: number;
  tendency: TendencyType;
};

export type Response = {
  latest: BloodSugarData;
  previous: BloodSugarData;
};

export interface ConnectorInterface {
  login(): boolean;
  getLatestValues(): Promise<Response>;
}
