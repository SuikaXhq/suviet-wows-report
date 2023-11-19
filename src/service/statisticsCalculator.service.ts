import { Provide, Scope, ScopeEnum } from "@midwayjs/core";
import { InjectEntityModel } from "@midwayjs/typeorm";
import { Battle, BattleTypeEnum } from "../model/battle.model";
import { Account } from "../model/account.model";
import { Between, Repository } from "typeorm";
import { Ship } from "../model/ship.model";

@Provide()
@Scope(ScopeEnum.Request, { allowDowngrade: true })
export class StatisticsCalculatorService {
    @InjectEntityModel(Battle)
    battleModel: Repository<Battle>;

    async battleSummary(account: Account, ship: Ship, battleType: BattleTypeEnum, startTime?: Date, endTime?: Date): Promise<Omit<Battle, 'battleId'>> {
        if (startTime === undefined) {
            startTime = new Date(0);
        }
        if (endTime === undefined) {
            endTime = new Date();
        }
        const battles = await this.battleModel.find({
            where: {
                account: account,
                ship: ship,
                battleType: battleType,
                battleTime: Between(startTime.getTime() / 1000, endTime.getTime() / 1000)
            }
        });
        let mergedBattles = Battle.mergeBattles(battles); // return all 0 when battles is empty
        return {
            ...mergedBattles,
            account: account,
            ship: ship,
            battleType: battleType,
            battleTime: Math.max(...battles.map(battle => battle.battleTime)),
        }
    }
}
