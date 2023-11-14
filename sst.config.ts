import { SSTConfig } from 'sst';
import { API } from './stacks/main';

export default {
  config() {
    return {
      name: 'water-consumption-calculator',
      region: 'eu-west-1',
    };
  },
  stacks(app) {
    app.stack(API);
  },
} satisfies SSTConfig;
