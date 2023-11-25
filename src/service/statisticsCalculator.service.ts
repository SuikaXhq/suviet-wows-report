import { ILogger, Inject, Provide, Scope, ScopeEnum } from "@midwayjs/core";
import { InjectEntityModel } from "@midwayjs/typeorm";
import { Battle, BattleTypeEnum, CalculatedBattle } from "../model/battle.model";
import { Account } from "../model/account.model";
import { Between, FindManyOptions, In, Repository } from "typeorm";
import { Ship } from "../model/ship.model";
import { StatisticsReduceTypeEnum } from "../types/statisticsCalculator.types";

@Provide()
@Scope(ScopeEnum.Request, { allowDowngrade: true })
export class StatisticsCalculatorService {
    @InjectEntityModel(Battle)
    battleModel: Repository<Battle>;

    @Inject()
    logger: ILogger;

    async getStatistics(account: Account, options?: GetStatisticsOptions): Promise<CalculatedBattle> {
        if (options === undefined || options === null || options.startTime === undefined || options.startTime === null) {
            options.startTime = new Date(0);
        }
        if (options === undefined || options === null || options.endTime === undefined || options.endTime === null) {
            options.endTime = new Date();
        }
        const findOptions: FindManyOptions = {
            where: {
                account: account,
                battleTime: Between(options.startTime.getTime() / 1000, options.endTime.getTime() / 1000)
            }
        };
        if (options.battleType !== undefined) {
            if (Array.isArray(options.battleType)) {
                findOptions.where['battleType'] = In(options.battleType);
            } else {
                findOptions.where['battleType'] = options.battleType;
            }
        }
        if (options.ship !== undefined) {
            findOptions.where['ship'] = options.ship;
        }
        const battles = await this.battleModel.find(findOptions);
        if (battles.length === 0) {
            this.logger.debug('StatisticsCalculatorService: battle not found, returning zero result.');
        }
        const mergedBattles = this.reduceBattles(battles, StatisticsReduceTypeEnum.AVG);

        return mergedBattles;
    }

    async battleSummary(account: Account, ship: Ship, battleType: BattleTypeEnum, options?: BattleSummaryOptions): Promise<CalculatedBattle> {
        if (options === undefined || options === null || options.startTime === undefined || options.startTime === null) {
            options.startTime = new Date(0);
        }
        if (options === undefined || options === null || options.endTime === undefined || options.endTime === null) {
            options.endTime = new Date();
        }
        const battles = await this.battleModel.find({
            where: {
                account: account,
                ship: ship,
                battleType: battleType,
                battleTime: Between(options.startTime.getTime() / 1000, options.endTime.getTime() / 1000)
            }
        });
        if (battles.length === 0) {
            this.logger.debug('StatisticsCalculatorService: battle not found, returning zero result.');
        }

        const mergedBattles = this.reduceBattles(battles, options.reduce ?? StatisticsReduceTypeEnum.SUM);

        return mergedBattles;
    }

    reduceBattles(battles: CalculatedBattle[], reduce: StatisticsReduceTypeEnum): CalculatedBattle {
        let mergedBattles: CalculatedBattle;
        switch (reduce) {
            default:
            case StatisticsReduceTypeEnum.SUM:
                mergedBattles = Battle.mergeBattles(battles); // return all 0 when battles is empty
                break;
            case StatisticsReduceTypeEnum.AVG:
                mergedBattles = Battle.mergeBattles(battles); // return all 0 when battles is empty
                let totalNumberOfBattles = 0;
                battles.forEach(battle => {
                    totalNumberOfBattles += battle.numberOfBattles;
                });
                mergedBattles.numberOfBattles = 1;
                mergedBattles.wins /= totalNumberOfBattles;
                mergedBattles.damageDealt /= totalNumberOfBattles;
                mergedBattles.damageScouting /= totalNumberOfBattles;
                mergedBattles.damagePotential /= totalNumberOfBattles;
                mergedBattles.capturePoints /= totalNumberOfBattles;
                mergedBattles.capturePointsDropped /= totalNumberOfBattles;
                mergedBattles.fragsTotal /= totalNumberOfBattles;
                mergedBattles.planesKilled /= totalNumberOfBattles;
                mergedBattles.survives /= totalNumberOfBattles;
                mergedBattles.xp /= totalNumberOfBattles;
                mergedBattles.fragsByMain /= totalNumberOfBattles;
                mergedBattles.fragsBySecondary /= totalNumberOfBattles;
                mergedBattles.fragsByTorpedoes /= totalNumberOfBattles;
                mergedBattles.fragsByRamming /= totalNumberOfBattles;
                mergedBattles.fragsByAircraft /= totalNumberOfBattles;
                mergedBattles.hitsByMain /= totalNumberOfBattles;
                mergedBattles.hitsBySecondary /= totalNumberOfBattles;
                mergedBattles.hitsByTorpedoes /= totalNumberOfBattles;
                mergedBattles.shotsByMain /= totalNumberOfBattles;
                mergedBattles.shotsBySecondary /= totalNumberOfBattles;
                mergedBattles.shotsByTorpedoes /= totalNumberOfBattles;
                break;
            case StatisticsReduceTypeEnum.MAX:
                mergedBattles = Battle.createEmptyBattle();
                battles.forEach(battle => {
                    mergedBattles.numberOfBattles = Math.max(mergedBattles.numberOfBattles, battle.numberOfBattles);
                    mergedBattles.wins = Math.max(mergedBattles.wins, battle.wins);
                    mergedBattles.damageDealt = Math.max(mergedBattles.damageDealt, battle.damageDealt);
                    mergedBattles.damageScouting = Math.max(mergedBattles.damageScouting, battle.damageScouting);
                    mergedBattles.damagePotential = Math.max(mergedBattles.damagePotential, battle.damagePotential);
                    mergedBattles.capturePoints = Math.max(mergedBattles.capturePoints, battle.capturePoints);
                    mergedBattles.capturePointsDropped = Math.max(mergedBattles.capturePointsDropped, battle.capturePointsDropped);
                    mergedBattles.fragsTotal = Math.max(mergedBattles.fragsTotal, battle.fragsTotal);
                    mergedBattles.planesKilled = Math.max(mergedBattles.planesKilled, battle.planesKilled);
                    mergedBattles.survives = Math.max(mergedBattles.survives, battle.survives);
                    mergedBattles.xp = Math.max(mergedBattles.xp, battle.xp);
                    mergedBattles.fragsByMain = Math.max(mergedBattles.fragsByMain, battle.fragsByMain);
                    mergedBattles.fragsBySecondary = Math.max(mergedBattles.fragsBySecondary, battle.fragsBySecondary);
                    mergedBattles.fragsByTorpedoes = Math.max(mergedBattles.fragsByTorpedoes, battle.fragsByTorpedoes);
                    mergedBattles.fragsByRamming = Math.max(mergedBattles.fragsByRamming, battle.fragsByRamming);
                    mergedBattles.fragsByAircraft = Math.max(mergedBattles.fragsByAircraft, battle.fragsByAircraft);
                    mergedBattles.hitsByMain = Math.max(mergedBattles.hitsByMain, battle.hitsByMain);
                    mergedBattles.hitsBySecondary = Math.max(mergedBattles.hitsBySecondary, battle.hitsBySecondary);
                    mergedBattles.hitsByTorpedoes = Math.max(mergedBattles.hitsByTorpedoes, battle.hitsByTorpedoes);
                    mergedBattles.shotsByMain = Math.max(mergedBattles.shotsByMain, battle.shotsByMain);
                    mergedBattles.shotsBySecondary = Math.max(mergedBattles.shotsBySecondary, battle.shotsBySecondary);
                    mergedBattles.shotsByTorpedoes = Math.max(mergedBattles.shotsByTorpedoes, battle.shotsByTorpedoes);
                });
                break;
            case StatisticsReduceTypeEnum.MIN:
                mergedBattles = Battle.createEmptyBattle();
                battles.forEach(battle => {
                    mergedBattles.numberOfBattles = Math.min(mergedBattles.numberOfBattles, battle.numberOfBattles);
                    mergedBattles.wins = Math.min(mergedBattles.wins, battle.wins);
                    mergedBattles.damageDealt = Math.min(mergedBattles.damageDealt, battle.damageDealt);
                    mergedBattles.damageScouting = Math.min(mergedBattles.damageScouting, battle.damageScouting);
                    mergedBattles.damagePotential = Math.min(mergedBattles.damagePotential, battle.damagePotential);
                    mergedBattles.capturePoints = Math.min(mergedBattles.capturePoints, battle.capturePoints);
                    mergedBattles.capturePointsDropped = Math.min(mergedBattles.capturePointsDropped, battle.capturePointsDropped);
                    mergedBattles.fragsTotal = Math.min(mergedBattles.fragsTotal, battle.fragsTotal);
                    mergedBattles.planesKilled = Math.min(mergedBattles.planesKilled, battle.planesKilled);
                    mergedBattles.survives = Math.min(mergedBattles.survives, battle.survives);
                    mergedBattles.xp = Math.min(mergedBattles.xp, battle.xp);
                    mergedBattles.fragsByMain = Math.min(mergedBattles.fragsByMain, battle.fragsByMain);
                    mergedBattles.fragsBySecondary = Math.min(mergedBattles.fragsBySecondary, battle.fragsBySecondary);
                    mergedBattles.fragsByTorpedoes = Math.min(mergedBattles.fragsByTorpedoes, battle.fragsByTorpedoes);
                    mergedBattles.fragsByRamming = Math.min(mergedBattles.fragsByRamming, battle.fragsByRamming);
                    mergedBattles.fragsByAircraft = Math.min(mergedBattles.fragsByAircraft, battle.fragsByAircraft);
                    mergedBattles.hitsByMain = Math.min(mergedBattles.hitsByMain, battle.hitsByMain);
                    mergedBattles.hitsBySecondary = Math.min(mergedBattles.hitsBySecondary, battle.hitsBySecondary);
                    mergedBattles.hitsByTorpedoes = Math.min(mergedBattles.hitsByTorpedoes, battle.hitsByTorpedoes);
                    mergedBattles.shotsByMain = Math.min(mergedBattles.shotsByMain, battle.shotsByMain);
                    mergedBattles.shotsBySecondary = Math.min(mergedBattles.shotsBySecondary, battle.shotsBySecondary);
                    mergedBattles.shotsByTorpedoes = Math.min(mergedBattles.shotsByTorpedoes, battle.shotsByTorpedoes);
                });
                break;
        }
        return mergedBattles;
    }
}

export interface BattleSummaryOptions {
    startTime?: Date;
    endTime?: Date;
    reduce?: StatisticsReduceTypeEnum;
}

export interface GetStatisticsOptions {
    ship?: Ship;
    battleType?: BattleTypeEnum | BattleTypeEnum[];
    startTime?: Date;
    endTime?: Date;
}
