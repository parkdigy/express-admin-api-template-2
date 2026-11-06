export interface IJobBase {
  $$run(): Promise<void>;
  handler(): Promise<void>;
}

class JobBase implements IJobBase {
  static $$running: Record<string, boolean> = {};

  async $$run() {
    const id = this.getId();

    if (JobBase.$$running[id]) return;
    JobBase.$$running[id] = true;

    try {
      await this.handler();
      JobBase.$$running[id] = false;
    } catch {
      JobBase.$$running[id] = false;
    }
  }

  getId(): string {
    throw Error('getId() 함수를 구현해야합니다.');
  }

  async handler() {
    throw Error(`handler() 함수를 구현해야합니다.`);
  }
}

export default JobBase;

export { JobBase };
