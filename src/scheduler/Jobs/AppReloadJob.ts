import JobBase from '../JobBase';
import logging from '@common_logging';
import { exec } from 'child_process';

// if (process.env.APP_ENV === 'local') {
//   setTimeout(async () => {
//     await new AppReloadJob().handler();
//   }, 1000);
// }

class AppReloadJob extends JobBase {
  getId(): string {
    return 'AppReloadJob';
  }

  async handler() {
    try {
      ll(this.getId(), 'start');

      exec('npm run pm2:reload');

      ll(this.getId(), 'complete');
    } catch (err) {
      logging.err(this.getId(), (err as Error).toString());
    }
  }
}

export default AppReloadJob;
