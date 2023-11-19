import { Inject, Provide } from "@midwayjs/core";
import { Account } from "../model/account.model";
import { InjectEntityModel } from "@midwayjs/typeorm";
import { Repository } from "typeorm";
import { Context } from "@midwayjs/koa";
import { APIRequestService } from "./apiRequest.service";
import { APIRequestTargetEnum } from "../types/apiRequest.types";

@Provide()
export class AccountService {
    @InjectEntityModel(Account)
    accountModel: Repository<Account>;

    @Inject()
    ctx: Context;

    @Inject()
    apiRequestService: APIRequestService;

    async createAccount(): Promise<Account>{
        // 检查是否已经存在
        const account = await this.accountModel.findOne({
            where: {
                accountId: this.ctx.accountId,
            }
        });
        if (account) {
            throw new Error('account already exists');
        }
        const newAccount = new Account();
        newAccount.accountId = this.ctx.accountId;
        newAccount.nickName = this.ctx.nickName;
        return await this.accountModel.save(account);
    }

    async queryAccountByExactNickName(): Promise<Account>{
        try {
            const result = await this.apiRequestService.createQuery<{
                nickname: string;
                account_id: number;
            }[]>({
                requestTarget: APIRequestTargetEnum.Players,
                search: this.ctx.nickName,
                type: 'exact'
            }).query();
            if (result.meta.count === 0) {
                return null;
            }
            const account = new Account();
            account.accountId = result.data[0].account_id;
            account.nickName = result.data[0].nickname;
            return account;
        } catch (error) {
            console.log(error);
        }
    }

    async getAccount(): Promise<Account>{
        const account = await this.accountModel.findOne({
            where: {
                accountId: this.ctx.accountId,
            }
        });
        if (account) {
            return account;
        } else {
            throw new Error('Account not found.');
        }
    }

}
