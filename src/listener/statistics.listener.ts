import { Context, DataListener, Inject, Singleton } from "@midwayjs/core";
import { APIRequestService } from "../service/apiRequest.service";
import { Repository } from "typeorm";
import { Battle } from "../model/battle.model";
import { InjectEntityModel } from "@midwayjs/typeorm";
import { Account } from "../model/account.model";

@Singleton()
export class StatisticsListener extends DataListener<void> {
    @Inject()
    ctx: Context;

    @Inject()
    apiRequestService: APIRequestService;

    @InjectEntityModel(Battle)
    battleModel: Repository<Battle>;

    @InjectEntityModel(Account)
    accountModel: Repository<Account>;

    private intervalHandler;

    initData() {
        return;
    }

    onData() {
        this.intervalHandler = setInterval(async () => {
            let accounts = await this.accountModel.find();
            await Promise.all(accounts.map(account => this._updateBattles(account)));
        }, 1000 * 60) // update per minute
    }

    async destroyListener() {
        clearInterval(this.intervalHandler);
    }

    private async _updateBattles(account: Account): Promise<void> {

    }

}
