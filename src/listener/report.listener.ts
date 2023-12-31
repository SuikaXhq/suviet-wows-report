import { Autoload, ILogger, Init, Inject, Singleton } from "@midwayjs/core";
import { ReportService } from "../service/report.service";
import { InjectEntityModel } from "@midwayjs/typeorm";
import { Group } from "../model/group.model";
import { Repository } from "typeorm";
import * as schedule from 'node-schedule';
import { DateService } from "../service/date.service";

@Autoload()
@Singleton()
export class ReportListener {
    @Inject()
    logger: ILogger;

    @InjectEntityModel(Group)
    groupModel: Repository<Group>;

    @Inject()
    reportService: ReportService;

    @Inject()
    dateService: DateService;

    private updateJob;

    @Init()
    async init() {
        this.logger.info('ReportListener: initializing.');
        // const groups = await this.groupModel.find({
        //     relations: ['accounts']
        // });
        // await Promise.all(groups.map(async group => {
        //     // 从有单场记录开始更新
        //     const firstDay = new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 6);
        //     for (let i = 0; i < 6; i++) {
        //         const today = new Date(firstDay.getTime() + 1000 * 60 * 60 * 24 * i);
        //         await this.reportService.updateDailyReport(group, today);
        //         this.logger.info(`ReportListener: updated daily report for group ${group.groupName} for timestamp ${today.getTime() / 1000}.`);
        //     }
        // }));
        const groups = await this.groupModel.find({
            relations: ['accounts']
        });
        await Promise.all(groups.map(async group => {
            await this.reportService.createDailyReport(group, new Date());
            this.logger.info(`ReportListener: ensure creation of today's daily report for group ${group.groupName}.`);
        }));
        this.updateJob = schedule.scheduleJob('0 0 3 * * *', async () => {
            const groups = await this.groupModel.find({
                relations: ['accounts']
            });
            const lastDay = this.dateService.getEndDate(new Date(new Date().getTime() - 10000));
            await Promise.all(groups.map(async group => {
                await this.reportService.createDailyReport(group, new Date());
                this.logger.info(`ReportListener: created of today's daily report for group ${group.groupName}.`);
                await this.reportService.updateDailyReport(group, lastDay);
                this.logger.info(`ReportListener: updated last day's daily report for group ${group.groupName}.`);
            }));
        });
    }

    async destroy() {
        this.updateJob.cancel();
        this.logger.info('ReportListener: schedule cancelled.')
    }
}
