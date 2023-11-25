import { Inject, Controller, Post, Get, Query, Body, ILogger } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { AccountService } from '../service/account.service';
import { APIResponse } from '../types/api.types';
import { Account } from '../model/account.model';
import { GroupService } from '../service/group.service';
import { Group } from '../model/group.model';

@Controller('/api')
export class APIController {
    @Inject()
    ctx: Context;

    @Inject()
    accountService: AccountService;

    @Inject()
    groupService: GroupService;

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

    @Get('/group')
    async getGroup(@Query('groupId') groupId: number): Promise<APIResponse<Group>> {
        this.logger.info(`Get /api/group with query {groupId: ${groupId}}`);
        try {
            const group = await this.groupService.getGroup(groupId, true);
            this.logger.info(`APIController: Get group ${groupId}.`);
            return {
                status: 'success',
                data: group
            };
        } catch (error) {
            this.logger.error('APIController: Error occurred when get group.');
            this.logger.error(error);
            return {
                status: 'failed',
                error: error.message
            };
        }
    }

    @Post('/group/create')
    async createGroup(@Body('groupName') groupName: string): Promise<APIResponse<Group>> {
        this.logger.info(`Post /api/group/create with body {groupName: ${groupName}}`);
        try {
            const group = await this.groupService.createGroup(groupName);
            this.logger.info(`APIController: Create group ${groupName} success.`);
            this.logger.debug(group);
            return {
                status: 'success',
                data: group
            };
        } catch (error) {
            this.logger.error('APIController: Error occurred when create group.');
            this.logger.error(error);
            return {
                status: 'failed',
                error: error.message
            };
        }
    }

    @Post('/group/member/add')
    async addGroupMember(@Body('groupId') groupId: number, @Body('accountId') accountId: number): Promise<APIResponse<void>> {
        this.logger.info(`Post /api/group/member/add with body {groupId: ${groupId}, accountId: ${accountId}}`);
        try {
            const group = await this.groupService.getGroup(groupId, true);
            const account = await this.accountService.getAccount(accountId);
            await this.groupService.addMember(group, account);
            this.logger.info(`APIController: Add account ${accountId} to group ${groupId} success.`);
            return {
                status: 'success'
            };
        } catch (error) {
            this.logger.error('APIController: Error occurred when add group member.');
            this.logger.error(error);
            return {
                status: 'failed',
                error: error.message
            };
        }
    }
}
