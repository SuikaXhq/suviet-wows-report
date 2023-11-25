import { Autoload, ILogger, Init, Inject, Singleton } from "@midwayjs/core";
import { APIRequestService } from "../service/apiRequest.service";
import { Repository } from "typeorm";
import { Battle, BattleTypeEnum } from "../model/battle.model";
import { InjectEntityModel } from "@midwayjs/typeorm";
import { Account } from "../model/account.model";
import { StatisticsCalculatorService } from "../service/statisticsCalculator.service";
import * as schedule from 'node-schedule';
import { APIRequestTargetEnum, PvpStats, StatisticsOfPlayerShipQueryData } from "../types/apiRequest.types";
import { Ship } from "../model/ship.model";
import { ShipListener } from "./ship.listener";

@Autoload()
@Singleton()
export class StatisticsListener {

    @Inject()
    apiRequestService: APIRequestService;

    @Inject()
    statisticsCalculator: StatisticsCalculatorService;

    @Inject()
    shipListener: ShipListener;

    @InjectEntityModel(Battle)
    battleModel: Repository<Battle>;

    @InjectEntityModel(Account)
    accountModel: Repository<Account>;

    @InjectEntityModel(Ship)
    shipModel: Repository<Ship>;

    @Inject()
    logger: ILogger;

    private updateJob;

    @Init()
    async init() {
        this.logger.info('StatisticsListener: initializing.');
        this.updateJob = schedule.scheduleJob('0 * * * * *', async () => {
            try {
                let accounts = await this.accountModel.find();
                await this._updateBattles(accounts);
            } catch (error) {
                this.logger.error('StatisticsListener: Failed to update battles.');
                this.logger.error(error);
            }

        });
    }

    async destory() {
        this.updateJob.cancel();
    }

    private async _updateBattles(accounts: Account[]): Promise<void> {
        if (accounts.length === 0) {
            return;
        }
        // 获取玩家当前API中最后一场战斗的时间
        const lastBattleTimesQueryResult = await this.apiRequestService.createQuery<{
            [account_id: number]: {
                last_battle_time: number;
            }
        }>({
            requestTarget: APIRequestTargetEnum.PlayerPersonalData,
            account_id: accounts.map(account => account.accountId),
            fields: ['last_battle_time'],
        }).query();
        if (lastBattleTimesQueryResult.status !== 'ok') {
            throw new Error('Failed to get last battle times');
        }
        // 筛出需要更新的玩家
        const accountsToUpdate = accounts.filter(account => {
            if (account.lastUpdatedTime === undefined || account.lastUpdatedTime === null) {
                return true;
            }
            return account.lastUpdatedTime < lastBattleTimesQueryResult.data[account.accountId].last_battle_time;
        });
        if (accountsToUpdate.length === 0) {
            return;
        }
        this.logger.info(`StatisticsListener: change of ${accountsToUpdate.length} account(s) detected.`)

        // 寻找数据变化的船，更新数据
        await Promise.all(accountsToUpdate.map(async account => {
            // 获得当前API给出的战斗场数
            const shipLastBattleTimesQueryResult = await this.apiRequestService.createQuery<{
                [account_id: number]: {
                    ship_id: number;
                    pvp_solo: {
                        battles: number;
                    };
                    pvp_div2: {
                        battles: number;
                    };
                    pvp_div3: {
                        battles: number;
                    };
                }[]
            }>({
                requestTarget: APIRequestTargetEnum.StatisticsOfPlayerShips,
                account_id: account.accountId,
                fields: ['ship_id', 'pvp_solo.battles', 'pvp_div2.battles', 'pvp_div3.battles'],
                extra: ['pvp_solo', 'pvp_div2', 'pvp_div3'],
            }).query();
            if (shipLastBattleTimesQueryResult.status !== 'ok') {
                throw new Error(`Failed to get ship last battle times of account ${account.accountId}`);
            }
            const shipNOBattles = shipLastBattleTimesQueryResult.data[account.accountId];
            const shipNOBattlesConverted: {
                [ship_id: number]: {
                    pvp_solo: number;
                    pvp_div2: number;
                    pvp_div3: number;
                };
            } = {};
            shipNOBattles.forEach(shipNOBattle => {
                shipNOBattlesConverted[shipNOBattle.ship_id] = {
                    pvp_solo: shipNOBattle.pvp_solo.battles,
                    pvp_div2: shipNOBattle.pvp_div2.battles,
                    pvp_div3: shipNOBattle.pvp_div3.battles,
                };
            });

            // 获取数据库中每条船的战斗数，分为solo、div2、div3
            const savedShipNOBattles = await this.battleModel
                .createQueryBuilder('battle')
                .select('battle.ship')
                .addSelect('battle.battleType')
                .addSelect('COUNT(battle.battleId)', 'NObattles')
                .where('battle.account = :account', { account: account })
                .groupBy('battle.ship')
                .addGroupBy('battle.battleType')
                .getRawMany<{
                    shipId: number;
                    battleType: BattleTypeEnum;
                    NObattles: number;
                }>();
            const savedShipNOBattlesConverted: {
                [ship_id: number]: {
                    [battleType: string]: number;
                };
            } = {};
            savedShipNOBattles.forEach(savedShipNOBattle => {
                if (savedShipNOBattlesConverted[savedShipNOBattle.shipId] === undefined || savedShipNOBattlesConverted[savedShipNOBattle.shipId] === null) {
                    savedShipNOBattlesConverted[savedShipNOBattle.shipId] = {};
                }
                savedShipNOBattlesConverted[savedShipNOBattle.shipId][savedShipNOBattle.battleType] = savedShipNOBattle.NObattles;
            });

            // 找出需要更新的ship_id
            const shipIdsToUpdate = Object.keys(shipNOBattlesConverted).filter(shipId => {
                const savedShipNOBattles = savedShipNOBattlesConverted[shipId];
                const shipNOBattles = shipNOBattlesConverted[shipId];
                return savedShipNOBattles === undefined
                    || savedShipNOBattles === null
                    || savedShipNOBattles.pvp_solo < shipNOBattles.pvp_solo
                    || savedShipNOBattles.pvp_div2 < shipNOBattles.pvp_div2
                    || savedShipNOBattles.pvp_div3 < shipNOBattles.pvp_div3;
            }).map(shipId => parseInt(shipId));

            // 获取需要更新的ship_id的战斗数据
            const battlesQueryResult = await this.apiRequestService.createQuery<Partial<StatisticsOfPlayerShipQueryData>>({
                requestTarget: APIRequestTargetEnum.StatisticsOfPlayerShips,
                account_id: account.accountId,
                ship_id: shipIdsToUpdate.length > 100 ? [] : shipIdsToUpdate,
                fields: ['ship_id', 'last_battle_time', 'pvp_solo', 'pvp_div2', 'pvp_div3'],
                extra: ['pvp_solo', 'pvp_div2', 'pvp_div3'],
            }).query();
            const presentStatistics = battlesQueryResult.data[account.accountId];
            const presentStatisticsConverted: {
                [ship_id: number]: {
                    last_battle_time: number;
                    pvp_solo: Partial<PvpStats>;
                    pvp_div2: Partial<PvpStats>;
                    pvp_div3: Partial<PvpStats>;
                };
            } = {};
            presentStatistics.forEach(presentStatistic => {
                presentStatisticsConverted[presentStatistic.ship_id] = {
                    last_battle_time: presentStatistic.last_battle_time,
                    pvp_solo: presentStatistic.pvp_solo,
                    pvp_div2: presentStatistic.pvp_div2,
                    pvp_div3: presentStatistic.pvp_div3,
                };
            });

            // 获取数据库中每条船的战斗数据
            await Promise.all(presentStatistics.map(async presentStatistic => {
                const currentShip = await this.shipModel.findOne({
                    where: {
                        shipId: presentStatistic.ship_id,
                    },
                });
                if (currentShip === undefined || currentShip === null) {
                    await this.shipListener.createShip(presentStatistic.ship_id);
                }
                await Promise.all(Object.values(BattleTypeEnum).map(async battleType => {
                    const existingStatistic = await this.statisticsCalculator.battleSummary(
                        account,
                        currentShip,
                        battleType,
                    );

                    // 进行差分，得到需要插入的Battle对象
                    const updatedBattle = Battle.substractBattle({
                        numberOfBattles: presentStatistic[battleType].battles,
                        wins: presentStatistic[battleType].wins,
                        damageDealt: presentStatistic[battleType].damage_dealt,
                        damageScouting: presentStatistic[battleType].damage_scouting,
                        damagePotential: presentStatistic[battleType].art_agro,
                        capturePoints: presentStatistic[battleType].capture_points,
                        capturePointsDropped: presentStatistic[battleType].dropped_capture_points,
                        fragsTotal: presentStatistic[battleType].frags,
                        planesKilled: presentStatistic[battleType].planes_killed,
                        survives: presentStatistic[battleType].survived_battles,
                        xp: presentStatistic[battleType].xp,
                        fragsByMain: presentStatistic[battleType].main_battery.frags,
                        fragsBySecondary: presentStatistic[battleType].second_battery.frags,
                        fragsByTorpedoes: presentStatistic[battleType].torpedoes.frags,
                        fragsByRamming: presentStatistic[battleType].ramming.frags,
                        fragsByAircraft: presentStatistic[battleType].aircraft.frags,
                        hitsByMain: presentStatistic[battleType].main_battery.hits,
                        hitsBySecondary: presentStatistic[battleType].second_battery.hits,
                        hitsByTorpedoes: presentStatistic[battleType].torpedoes.hits,
                        shotsByMain: presentStatistic[battleType].main_battery.shots,
                        shotsBySecondary: presentStatistic[battleType].second_battery.shots,
                        shotsByTorpedoes: presentStatistic[battleType].torpedoes.shots,
                    }, existingStatistic);

                    // 更新数据库
                    if (updatedBattle.numberOfBattles > 0) {
                        this.battleModel.save({
                            ...updatedBattle,
                            account: account,
                            ship: currentShip,
                            battleTime: presentStatistic.last_battle_time,
                            battleType: battleType,
                        });
                        this.logger.info(`StatisticsListener: Updated ${updatedBattle.numberOfBattles} battle(s) of account ${account.accountId}, ship ${currentShip.shipId}, battle type ${battleType} at timestamp ${presentStatistic.last_battle_time}.`);
                    }
                }));
            }));
            await Promise.all(accountsToUpdate.map(async account => {
                account.lastUpdatedTime = lastBattleTimesQueryResult.data[account.accountId].last_battle_time;
                await this.accountModel.save(account);
            }));
        }));
    }
}
