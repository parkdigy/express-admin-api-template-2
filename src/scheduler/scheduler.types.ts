import { Job } from 'node-schedule';

export interface Scheduler {
  $jobs: Job[];
  $start(): void;
}
