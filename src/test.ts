import { DexcomApiClient } from '@diakem/dexcom-api-client';

// Initialize the client by providing credentials and server location
const { read } = DexcomApiClient({
  username: 'username',
  password: 'password',
  server: 'EU',
  debug: false,
});

// Retrieve data from the sharing service
const cgmData = await read();
console.log(cgmData);
