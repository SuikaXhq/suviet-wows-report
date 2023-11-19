import { Inject, Controller, Post, Get } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { AccountService } from '../service/account.service';
import { APIResponse } from '../types/api.types';
import { Account } from '../model/account.model';

@Controller('/api')
export class APIController {
    @Inject()
    ctx: Context;

    @Inject()
    accountService: AccountService;

    @Post('/account/create')
    async createAccount(): Promise<APIResponse<Account>> {
        try {
            const account = await this.accountService.createAccount();
            return {
                status: 'success',
                data: account
            };
        } catch (error) {
            return {
                status: 'failed',
                error: error.message
            };
        }
    }

    @Get('/account')
    async getAccount(): Promise<APIResponse<Account>> {
        try {
            const account = await this.accountService.getAccount();
            return {
                status: 'success',
                data: account
            };
        } catch (error) {
            return {
                status: 'failed',
                error: error.message
            };
        }
    }
}
