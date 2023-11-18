import { Provide } from "@midwayjs/core";
import { InjectEntityModel } from "@midwayjs/typeorm";
import { Battle, BattleTypeEnum, CalculatedBattle } from "../model/battle.model";
import { Account } from "../model/account.model";
import { Between, Repository } from "typeorm";
import { Ship } from "../model/ship.model";


@Provide()
export class StatisticsCalculatorService {
    @InjectEntityModel(Battle)
    battleModel: Repository<Battle>;

    @InjectEntityModel(Account)
    accountModel: Repository<Account>;

    async battleSummary(account: Account, ship: Ship, battleType: BattleTypeEnum, startTime?: Date, endTime?: Date): Promise<Battle> {
        if (startTime === undefined) {
            startTime = new Date();
            startTime.setDate(startTime.getDate() - 1);
        }
        if (endTime === undefined) {
            endTime = new Date();
        }
        const battles = await this.battleModel.find({
            where: {
                account: account,
                ship: ship,
                battleType: battleType,
                battleTime: Between(startTime, endTime)
            }
        });
        let mergedBattles = Battle.mergeBattles(battles);
        return {
            ...mergedBattles,
            battleId: null,
            account: account,
            ship: ship,
            battleTime: endTime,
        }
    }
}
