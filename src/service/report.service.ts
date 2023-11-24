import { Provide, Inject } from "@midwayjs/core";
import { ILogger } from "@midwayjs/logger";
import { InjectEntityModel } from "@midwayjs/typeorm";
import { Repository } from "typeorm";
import { GroupDailyReport } from "../model/groupDailyReport.model";
import { Group } from "../model/group.model";
import { Battle, CalculatedBattle } from "../model/battle.model";

@Provide()
export class ReportService {
    @Inject()
    logger: ILogger;

    @InjectEntityModel(GroupDailyReport)
    groupDailyReportModel: Repository<GroupDailyReport>;

    @InjectEntityModel(Battle)
    battleModel: Repository<Battle>;

    async updateDailyReport(group: Group, date: Date): Promise<void> {
        date.setHours(3, 0, 0, 0);
        let report = await this.groupDailyReportModel.findOne({
            where: {
                reportTime: date,
                group
            }
        });
        if (!report) {
            report = await this.createDailyReport(group, date);
        }

    }

    async createDailyReport(group: Group, date: Date): Promise<GroupDailyReport> {
        date.setHours(3, 0, 0, 0);
        const newReport = new GroupDailyReport();
        newReport.reportTime = date;
        newReport.group = group;
        return await this.groupDailyReportModel.save(newReport);
    }

    private _judgeBattles(battles: CalculatedBattle[], averageStatistics: CalculatedBattle): BattlesJudgeResult {
        let actor = 10;
        let prisoner = 10;
        let frags = 0;
        let scout = 0;
        let damage = 0;
        let antiAir = 0;
        battles.forEach(battle => {
            actor = Math.min(actor, battle.damageDealt / battle.numberOfBattles / averageStatistics.damageDealt);
        });
    }
}

interface BattlesJudgeResult {
    actor: number; // 演子程度（单场伤害相对对应单船平均伤害的最低百分比，只取败场数据）
    prisoner: number; // 战犯程度（同上，但是只取胜场数据）
    frags: number; // k头程度（最多单场k头数量）
    scout: number; // 点亮小子（最大单场侦查伤害）
    damage: number; // 场均小子（最大单场场均）
    antiAir: number; // 防空小子（最大单场打飞机数量）
}
