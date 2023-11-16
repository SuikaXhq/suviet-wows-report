import { DataListener, Singleton } from "@midwayjs/core";

@Singleton()
export class StatisticsListener implements DataListener {
  @Inject()
  ctx: Context;

  @Inject()
  logger: Logger;

  @Inject()
  statisticsService: StatisticsService;

  async onReady() {
    this.logger.info("StatisticsListener onReady");
    await this.statisticsService.init();
  }
}
