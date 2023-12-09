import { ILogger, Inject, Provide } from "@midwayjs/core";
import { Account } from "../model/account.model";
import { Battle, BattleTypeEnum } from "../model/battle.model";
import { Ship } from "../model/ship.model";
import { InjectEntityModel } from "@midwayjs/typeorm";
import { Between, FindManyOptions, Repository } from "typeorm";

@Provide()
export class BattleService {
    @Inject()
    logger: ILogger;

    @InjectEntityModel(Battle)
    battleModel: Repository<Battle>;

    async getBattle(account: Account, options: GetBattleOptions = {}): Promise<Battle[]> {
        if (!options.startTime) {
            options.startTime = new Date(0);
        }
        if (!options.endTime) {
            options.endTime = new Date();
        }
        const battleFindOptions: FindManyOptions = {
            where: {
                account: {
                    accountId: account.accountId,
                },
                battleTime: Between(options.startTime.getTime() / 1000, options.endTime.getTime() / 1000),
            }
        };
        if (options.battleType) {
            battleFindOptions.where['battleType'] = options.battleType;
        }
        if (options.ship) {
            battleFindOptions.where['ship'] = options.ship;
        }
        const battles = await this.battleModel.find(battleFindOptions);
        return battles;
    }
}

export interface GetBattleOptions {
    battleType?: BattleTypeEnum;
    startTime?: Date;
    endTime?: Date;
    ship?: Ship;
}
