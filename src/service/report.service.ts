import { Provide, Inject, Scope, ScopeEnum } from "@midwayjs/core";
import { ILogger } from "@midwayjs/logger";
import { InjectEntityModel } from "@midwayjs/typeorm";
import { Between,  Brackets,  In, Repository } from "typeorm";
import { GroupDailyReport } from "../model/groupDailyReport.model";
import { Group } from "../model/group.model";
import { Battle, BattleTypeEnum, CalculatedBattle } from "../model/battle.model";
import { StatisticsCalculatorService } from "./statisticsCalculator.service";
import { ShipTypeEnum } from "../model/ship.model";
import { DateService } from "./date.service";

@Provide()
@Scope(ScopeEnum.Request, { allowDowngrade: true })
export class ReportService {
    @Inject()
    logger: ILogger;

    @InjectEntityModel(GroupDailyReport)
    groupDailyReportModel: Repository<GroupDailyReport>;

    @InjectEntityModel(Battle)
    battleModel: Repository<Battle>;

    @Inject()
    statisticsCalculatorService: StatisticsCalculatorService;

    @Inject()
    dateService: DateService;

    async getDailyReportById(reportId: number): Promise<GroupDailyReport> {
        const battleRelations = {
            account: true,
            ship: true,
        }
        const report = await this.groupDailyReportModel.findOne({
            where: {
                reportId,
            },
            relations: {
                group: true,
                actorOfTheDay: battleRelations,
                prisonerOfWarOfTheDay: battleRelations,
                scoutBoyOfTheDay: battleRelations,
                damageBoyOfTheDay: battleRelations,
                antiAirBoyOfTheDay: battleRelations,
                fragBoyOfTheDay: battleRelations,
            }
        });
        return report;
    }

    /**
     * 根据Group和Date获取战报，若不指定Date则返回所有战报。
     * @param group
     * @param date
     * @returns 战报列表
     */
    async getDailyReport(group: Group, date?: Date): Promise<GroupDailyReport[]> {
        const battleRelations = {
            account: true,
            ship: true,
        }
        const whereOptions = {
            group,
        }
        if (date) {
            date = this.dateService.getEndDate(date);
            whereOptions['reportTime'] = date.getTime() / 1000;
        }
        await this.updateDailyReport(group, new Date());
        const report = await this.groupDailyReportModel.find({
            where: whereOptions,
            relations: {
                actorOfTheDay: battleRelations,
                prisonerOfWarOfTheDay: battleRelations,
                scoutBoyOfTheDay: battleRelations,
                damageBoyOfTheDay: battleRelations,
                antiAirBoyOfTheDay: battleRelations,
                fragBoyOfTheDay: battleRelations,
            },
            order: {
                reportTime: 'DESC',
            }
        });
        return report;
    }

    async getDailyBattleCount(reportId: number): Promise<number> {
        const report = await this.groupDailyReportModel.findOne({
            select: ['reportId', 'reportTime', 'group'],
            where: {
                reportId,
            },
            relations: ['group'],
        });
        if (!report) {
            throw new Error('report not found');
        }
        const [startTime, endDate] = this.dateService.getBothEnds(new Date(report.reportTime * 1000));
        const { count } = await this.battleModel.createQueryBuilder('battle')
            .select('COUNT(*)', 'count')
            .innerJoin('battle.account', 'account')
            .innerJoin('account.groups', 'group')
            .where('group.groupId = :groupId', { groupId: report.group.groupId })
            .andWhere('battle.battleTime BETWEEN :startTime AND :endDate', { startTime: startTime.getTime() / 1000, endDate: endDate.getTime() / 1000 })
            .andWhere(
                new Brackets(qb => {
                    qb.where('battle.battleType = :div2', { div2: BattleTypeEnum.PVP_DIV2 })
                        .orWhere('battle.battleType = :div3', { div3: BattleTypeEnum.PVP_DIV3 })
                })
            )
            .getRawOne<{ count: number }>();
        return count;
    }

    async updateDailyReport(group: Group, date: Date): Promise<GroupDailyReport> {
        date = this.dateService.getEndDate(date);
        let report = await this.groupDailyReportModel.findOne({
            where: {
                reportTime: date.getTime() / 1000,
                group
            },
        });
        if (!report) {
            report = await this.createDailyReport(group, date);
        }

        const battlesToday = await this.battleModel.find({
            where: {
                account: {
                    accountId: In(group.accounts.map(account => account.accountId)),
                },
                battleTime: Between(this.dateService.getStartDate(date).getTime() / 1000, date.getTime() / 1000),
                battleType: In([BattleTypeEnum.PVP_DIV2, BattleTypeEnum.PVP_DIV3])
            },
            relations: ['ship', 'account']
        });
        if (battlesToday.length === 0) {
            this.logger.debug(`ReportService: no battles today.`);
            return report;
        }
        const battleJudgesToday = await Promise.all(battlesToday.map(async battle => {
            const averageStatistics = await this.statisticsCalculatorService.getStatistics(battle.account, {
                ship: battle.ship,
                endTime: date,
            });
            const judgeResult = this._judgeBattles([battle], averageStatistics, battle.ship.shipType);
            this.logger.debug('ReportService: judge result for battle %j of account %j, ship %j: %j.', battle.battleId, battle.account.nickName, battle.ship.shipName, judgeResult);
            return judgeResult;
        }));
        const mergedResult = this._mergeJudgeResults(battleJudgesToday);
        this.logger.debug('ReportService: merged judge result: %j.', mergedResult);

        // TODO: 做成可配置
        if (battleJudgesToday[mergedResult.actor].actor >= 2) {
            report.actorOfTheDay = battlesToday[mergedResult.actor];
        } else {
            report.actorOfTheDay = null;
        }
        if (battleJudgesToday[mergedResult.prisoner].prisoner >= 2) {
            report.prisonerOfWarOfTheDay = battlesToday[mergedResult.prisoner];
        } else {
            report.prisonerOfWarOfTheDay = null;
        }
        if (battleJudgesToday[mergedResult.frags].frags >= 5) {
            report.fragBoyOfTheDay = battlesToday[mergedResult.frags];
        } else {
            report.fragBoyOfTheDay = null;
        }
        if (battleJudgesToday[mergedResult.scout].scout >= 250000) {
            report.scoutBoyOfTheDay = battlesToday[mergedResult.scout];
        } else {
            report.scoutBoyOfTheDay = null;
        }
        if (battleJudgesToday[mergedResult.damage].damage >= 250000) {
            report.damageBoyOfTheDay = battlesToday[mergedResult.damage];
        } else {
            report.damageBoyOfTheDay = null;
        }
        if (battleJudgesToday[mergedResult.antiAir].antiAir >= 35) {
            report.antiAirBoyOfTheDay = battlesToday[mergedResult.antiAir];
        } else {
            report.antiAirBoyOfTheDay = null;
        }

        this.logger.debug('ReportService: updated Report %j.', report);
        return await this.groupDailyReportModel.save(report);
    }

    async createDailyReport(group: Group, date: Date): Promise<GroupDailyReport> {
        date = this.dateService.getEndDate(date);
        const newReport = new GroupDailyReport();
        newReport.reportTime = date.getTime() / 1000;
        newReport.group = group;
        return await this.groupDailyReportModel.save(newReport);
    }

    /*
    // @deprecated 暂时弃用
    private async _getDailyBattlesPerShip(account: Account, date: Date): Promise<Map<Ship, Battle[]>> {
        const [startTime, endDate] = this.dateService.getBothEnds(date);
        const battles = await this.battleModel.find({
            where: {
                account,
                battleTime: Between(startTime.getTime() / 1000, endDate.getTime() / 1000),
                battleType: In([BattleTypeEnum.PVP_DIV2, BattleTypeEnum.PVP_DIV3])
            }
        });
        const battlesPerShip = new Map<Ship, Battle[]>();
        battles.forEach(battle => {
            if (!battlesPerShip.has(battle.ship)) {
                battlesPerShip.set(battle.ship, []);
            }
            battlesPerShip.get(battle.ship).push(battle);
        });
        return battlesPerShip;
    }
    */

    private _judgeBattles(battles: CalculatedBattle[], averageStatistics: CalculatedBattle, shipType: ShipTypeEnum): BattlesJudgeResult {
        let actor = 0;
        let prisoner = 0;
        let frags = 0;
        let scout = 0;
        let damage = 0;
        let antiAir = 0;
        battles.forEach(battle => {
            if (battle.wins > 0) {
                actor = Math.max(actor, this._getActorCriterion(shipType, averageStatistics) / this._getActorCriterion(shipType, battle));
            }
            if (battle.wins < battle.numberOfBattles) {
                prisoner = Math.max(prisoner, this._getActorCriterion(shipType, averageStatistics) / this._getActorCriterion(shipType, battle));
            }
            frags = Math.max(frags, battle.fragsTotal / battle.numberOfBattles);
            scout = Math.max(scout, battle.damageScouting / battle.numberOfBattles);
            damage = Math.max(damage, battle.damageDealt / battle.numberOfBattles);
            antiAir = Math.max(antiAir, battle.planesKilled / battle.numberOfBattles);
        });
        return {
            actor,
            prisoner,
            frags,
            scout,
            damage,
            antiAir
        };
    }

    private _mergeJudgeResults(judgeResults: BattlesJudgeResult[]): MergedBattlesJudgeResult {
        const actors = judgeResults.map(judgeResult => judgeResult.actor);
        const prisoners = judgeResults.map(judgeResult => judgeResult.prisoner);
        const fragses = judgeResults.map(judgeResult => judgeResult.frags);
        const scouts = judgeResults.map(judgeResult => judgeResult.scout);
        const damages = judgeResults.map(judgeResult => judgeResult.damage);
        const antiAirs = judgeResults.map(judgeResult => judgeResult.antiAir);
        return {
            actor: actors.indexOf(Math.max(...actors)),
            prisoner: prisoners.indexOf(Math.max(...prisoners)),
            frags: fragses.indexOf(Math.max(...fragses)),
            scout: scouts.indexOf(Math.max(...scouts)),
            damage: damages.indexOf(Math.max(...damages)),
            antiAir: antiAirs.indexOf(Math.max(...antiAirs)),
        };
    }

    private _getActorCriterion(shipType: ShipTypeEnum, battle: CalculatedBattle): number {
        let criterion: number;
        switch (shipType) {
            case ShipTypeEnum.Destroyer:
            case ShipTypeEnum.AirCarrier:
            case ShipTypeEnum.Submarine:
                criterion = battle.damageDealt + battle.damageScouting;
                break;
            default:
                criterion = battle.damageDealt;
                break;
        }
        return criterion / battle.numberOfBattles;
    }
}

interface BattlesJudgeResult {
    actor: number; // 演子程度（单场伤害相对对应单船平均伤害的最低百分比的倒数，只取胜场数据）
    prisoner: number; // 战犯程度（同上，但是只取败场数据）
    frags: number; // k头小子（最多单场k头数量）
    scout: number; // 点亮小子（最大单场侦查伤害）
    damage: number; // 抛屎小子（最大单场场均）
    antiAir: number; // 打飞机哥（最大单场打飞机数量）
}

interface MergedBattlesJudgeResult {
    // 以下number均代表下标索引
    actor: number;
    prisoner: number;
    frags: number;
    scout: number;
    damage: number;
    antiAir: number;
}
