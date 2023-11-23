import { Inject, Controller, Post, Get, Query, Body, ILogger } from '@midwayjs/core';
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

    @Inject()
    logger: ILogger;

    @Post('/account/create')
    async createAccount(@Body('accountId') accountId: number, @Body('nickName') nickName: string): Promise<APIResponse<Account>> {
        this.logger.info(`Post /api/account/create with body {accountId: ${accountId}, nickName: ${nickName}}`);
        try {
            const account = await this.accountService.createAccount(accountId, nickName);
            this.logger.info(`APIController: Create account ${accountId} success.`);
            this.logger.debug(account);
            return {
                status: 'success',
                data: account
            };
        } catch (error) {
            this.logger.error('APIController: Error occurred when create account.');
            this.logger.error(error);
            return {
                status: 'failed',
                error: error.message
            };
        }
    }

    @Get('/account')
    async getAccount(@Query('accountId') accountId: number): Promise<APIResponse<Account>> {
        this.logger.info(`Get /api/account with query {accountId: ${accountId}}`);
        try {
            const account = await this.accountService.getAccount(accountId);
            this.logger.info(`APIController: Get account ${accountId}.`);
            return {
                status: 'success',
                data: account
            };
        } catch (error) {
            this.logger.error('APIController: Error occurred when get account.');
            this.logger.error(error);
            return {
                status: 'failed',
                error: error.message
            };
        }
    }
}
