import { Autoload, Init, Inject, Singleton } from "@midwayjs/core";
import { APIRequestService } from "../service/apiRequest.service";
import { Repository } from "typeorm";
import { Battle } from "../model/battle.model";
import { InjectEntityModel } from "@midwayjs/typeorm";
import { Account } from "../model/account.model";
import { StatisticsCalculatorService } from "../service/statisticsCalculator.service";
import * as schedule from 'node-schedule';
import { APIRequestTargetEnum } from "../types/apiRequest.types";

@Autoload()
@Singleton()
export class StatisticsListener {

    @Inject()
    apiRequestService: APIRequestService;

    @Inject()
    statisticsCalculator: StatisticsCalculatorService;

    @InjectEntityModel(Battle)
    battleModel: Repository<Battle>;

    @InjectEntityModel(Account)
    accountModel: Repository<Account>;

    private updateJob;

    @Init()
    async init() {
        this.updateJob = schedule.scheduleJob('0 * * * * *', async () => {
            let accounts = await this.accountModel.find();
            await this._updateBattles(accounts);
        });
    }

    async destory() {
        this.updateJob.cancel();
    }

    private async _updateBattles(accounts: Account[]): Promise<void> {
        const savedLastBattleTimes = await this.battleModel
            .createQueryBuilder('battle')
            .select('battle.accountId')
            .addSelect('MAX(battle.battleTime)', 'lastBattleTime')
            .groupBy('battle.accountId')
            .getRawMany<{
                accountId: number;
                lastBattleTime: number;
            }>();
        const accountsToUpdate = accounts.filter(account => {
            const lastUpdatedTime = account.lastUpdatedTime;
            const savedLastBattleTime = savedLastBattleTimes.find(savedLastBattleTime => savedLastBattleTime.accountId === account.accountId).lastBattleTime;
            return lastUpdatedTime < savedLastBattleTime;
        });

        await Promise.all(accountsToUpdate.map(async account => {
            // get all ship last battle times and number of battles
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
            const shipLastBattleTimes = shipLastBattleTimesQueryResult.data[account.accountId];

            // compare with db, filter out the battles to update

            // update db

        });
    }

}
