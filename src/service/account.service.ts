import { ILogger, Inject, Provide } from "@midwayjs/core";
import { Account } from "../model/account.model";
import { InjectEntityModel } from "@midwayjs/typeorm";
import { Repository } from "typeorm";
import { APIRequestService } from "./apiRequest.service";
import { APIRequestTargetEnum } from "../types/apiRequest.types";

@Provide()
export class AccountService {
    @InjectEntityModel(Account)
    accountModel: Repository<Account>;

    @Inject()
    apiRequestService: APIRequestService;

    @Inject()
    logger: ILogger;

    async createAccount(accountId: number, nickName: string): Promise<Account>{
        // 检查是否已经存在
        const account = await this.accountModel.findOne({
            where: {
                accountId,
            }
        });
        if (account) {
            throw new Error('account already exists');
        }
        const newAccount = new Account();
        newAccount.accountId = accountId;
        newAccount.nickName = nickName;
        return await this.accountModel.save(account);
    }

    async queryAccountByExactNickName(nickName: string): Promise<Account>{
        try {
            const result = await this.apiRequestService.createQuery<{
                nickname: string;
                account_id: number;
            }[]>({
                requestTarget: APIRequestTargetEnum.Players,
                search: nickName,
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
            this.logger.error('AccountService: Error occurred when query account by exact nickname.')
            this.logger.error(error);
            return null;
        }
    }

    async getAccount(accountId: number, options: GetAccountOptions = {}): Promise<Account>{
        const findOptions = {
            where: {
                accountId,
            },
            relations: [],
        };
        if (options.withGroups) {
            findOptions['relations'].push('groups');
        }
        if (options.withShips) {
            findOptions['relations'].push('ships');
        }
        if (options.withBattles) {
            findOptions['relations'].push('battles');
        }
        return await this.accountModel.findOne(findOptions);
    }

}

export interface GetAccountOptions {
    withGroups?: boolean;
    withShips?: boolean;
    withBattles?: boolean;
}
