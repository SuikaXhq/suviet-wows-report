import { Provide, Inject, Scope, ScopeEnum } from "@midwayjs/core";
import { ILogger } from "@midwayjs/logger";
import { InjectEntityModel } from "@midwayjs/typeorm";
import { Between, In, Repository } from "typeorm";
import { GroupDailyReport } from "../model/groupDailyReport.model";
import { Group } from "../model/group.model";
import { Battle, BattleTypeEnum, CalculatedBattle } from "../model/battle.model";
import { Account } from "../model/account.model";
import { StatisticsCalculatorService } from "./statisticsCalculator.service";
import { Ship } from "../model/ship.model";
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

    async updateDailyReport(group: Group, date: Date): Promise<GroupDailyReport> {
        date = this.dateService.getEndDate(date);
        let report = await this.groupDailyReportModel.findOne({
            where: {
                reportTime: date.getTime() / 1000,
                group
            }
        });
        if (!report) {
            report = await this.createDailyReport(group, date);
        }
        const accountJudgesMap = new Map<Account, BattlesJudgeResult>();
        await Promise.all(group.accounts.map(async account => {
            const battlesPerShip = await this._getDailyBattlesPerShip(account, date);
            const judgeResults = [];
            for (const [ship, battles] of battlesPerShip) {
                const averageStatistics = await this.statisticsCalculatorService.getStatistics(account, {
                    ship,
                });
                const judgeResult = this._judgeBattles(battles, averageStatistics);
                judgeResults.push(judgeResult);
            }
            if (judgeResults.length === 0) {
                return;
            }
            accountJudgesMap.set(account, this._mergeJudgeResults(judgeResults));
        }));
        const compareResult = this._compareAccountJudges(accountJudgesMap);
        report.actorOfTheDay = compareResult.actor;
        report.prisonerOfWarOfTheDay = compareResult.prisoner;
        report.scoutBoyOfTheDay = compareResult.scout;
        report.damageBoyOfTheDay = compareResult.damage;
        report.antiAirBoyOfTheDay = compareResult.antiAir;
        report.fragBoyOfTheDay = compareResult.frags;
        this.logger.debug(`ReportService: updated Report ${report}.`)
        return await this.groupDailyReportModel.save(report);
    }

    async createDailyReport(group: Group, date: Date): Promise<GroupDailyReport> {
        date = this.dateService.getEndDate(date);
        const newReport = new GroupDailyReport();
        newReport.reportTime = date.getTime() / 1000;
        newReport.group = group;
        return await this.groupDailyReportModel.save(newReport);
    }

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

    private _judgeBattles(battles: CalculatedBattle[], averageStatistics: CalculatedBattle): BattlesJudgeResult {
        let actor = 10;
        let prisoner = 10;
        let frags = 0;
        let scout = 0;
        let damage = 0;
        let antiAir = 0;
        battles.forEach(battle => {
            if (battle.wins > 0) {
                actor = Math.min(actor, battle.damageDealt / battle.numberOfBattles / averageStatistics.damageDealt);
            }
            if (battle.wins < battle.numberOfBattles) {
                prisoner = Math.min(prisoner, battle.damageDealt / battle.numberOfBattles / averageStatistics.damageDealt);
            }
            frags = Math.max(frags, battle.fragsTotal);
            scout = Math.max(scout, battle.damageScouting);
            damage = Math.max(damage, battle.damageDealt / battle.numberOfBattles);
            antiAir = Math.max(antiAir, battle.planesKilled);
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

    private _mergeJudgeResults(judgeResults: BattlesJudgeResult[]): BattlesJudgeResult {
        let actor = 10;
        let prisoner = 10;
        let frags = 0;
        let scout = 0;
        let damage = 0;
        let antiAir = 0;
        judgeResults.forEach(judgeResult => {
            actor = Math.min(actor, judgeResult.actor);
            prisoner = Math.min(prisoner, judgeResult.prisoner);
            frags = Math.max(frags, judgeResult.frags);
            scout = Math.max(scout, judgeResult.scout);
            damage = Math.max(damage, judgeResult.damage);
            antiAir = Math.max(antiAir, judgeResult.antiAir);
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

    private _compareAccountJudges(judgesPerAccount: Map<Account, BattlesJudgeResult>): JudgeCompareResult {
        let actor: Account;
        let prisoner: Account;
        let frags: Account;
        let scout: Account;
        let damage: Account;
        let antiAir: Account;
        judgesPerAccount.forEach((judge, account) => {
            if (!actor || judge.actor < judgesPerAccount.get(actor).actor) {
                actor = account;
            }
            if (!prisoner || judge.prisoner < judgesPerAccount.get(prisoner).prisoner) {
                prisoner = account;
            }
            if (!frags || judge.frags > judgesPerAccount.get(frags).frags) {
                frags = account;
            }
            if (!scout || judge.scout > judgesPerAccount.get(scout).scout) {
                scout = account;
            }
            if (!damage || judge.damage > judgesPerAccount.get(damage).damage) {
                damage = account;
            }
            if (!antiAir || judge.antiAir > judgesPerAccount.get(antiAir).antiAir) {
                antiAir = account;
            }
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
}

interface BattlesJudgeResult {
    actor: number; // 演子程度（单场伤害相对对应单船平均伤害的最低百分比，只取胜场数据）
    prisoner: number; // 战犯程度（同上，但是只取败场数据）
    frags: number; // k头程度（最多单场k头数量）
    scout: number; // 点亮小子（最大单场侦查伤害）
    damage: number; // 场均小子（最大单场场均）
    antiAir: number; // 防空小子（最大单场打飞机数量）
}

interface JudgeCompareResult {
    actor: Account;
    prisoner: Account;
    frags: Account;
    scout: Account;
    damage: Account;
    antiAir: Account;
}
