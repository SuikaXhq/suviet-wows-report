import { Inject, Controller, Post, Get, Query, Body, ILogger, Param } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { AccountService } from '../service/account.service';
import { APIResponse } from '../types/api.types';
import { Account } from '../model/account.model';
import { GroupService } from '../service/group.service';
import { Group } from '../model/group.model';
import { ReportService } from '../service/report.service';
import { BattleService, GetBattleOptions } from '../service/battle.service';
import { GetStatisticsOptions, StatisticsCalculatorService } from '../service/statisticsCalculator.service';
import { Battle, BattleTypeEnum, CalculatedBattle } from '../model/battle.model';
import { DateService } from '../service/date.service';
import { ShipService } from '../service/ship.service';
import { Ship } from '../model/ship.model';
import { GroupDailyReport } from '../model/groupDailyReport.model';

@Controller('/api')
export class APIController {
    @Inject()
    ctx: Context;

    @Inject()
    accountService: AccountService;

    @Inject()
    groupService: GroupService;

    @Inject()
    reportService: ReportService;

    @Inject()
    battleService: BattleService;

    @Inject()
    statisticsCalculatorService: StatisticsCalculatorService;

    @Inject()
    dateService: DateService;

    @Inject()
    shipService: ShipService;

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

    @Get('/account/:accountId')
    async getAccount(@Param('accountId') accountId: number): Promise<APIResponse<Account>> {
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

    @Get('/group/:groupId')
    async getGroup(@Param('groupId') groupId: number): Promise<APIResponse<Group>> {
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

    @Get('/report/:groupId')
    async getReport(@Param('groupId') groupId: number, @Query('date') date: number): Promise<APIResponse<GroupDailyReport>> {
        this.logger.info(`Get /api/report with query {groupId: ${groupId}}`);
        try {
            const group = await this.groupService.getGroup(groupId, true);
            const report = await this.reportService.getDailyReport(group, new Date(date));
            this.logger.info(`APIController: Get ${date} report of group ${groupId} success.`);
            return {
                status: 'success',
                data: report
            };
        } catch (error) {
            this.logger.error('APIController: Error occurred when report group.');
            this.logger.error(error);
            return {
                status: 'failed',
                error: error.message
            };
        }
    }

    @Get('/battle/:accountId')
    async getBattle(
        @Param('accountId') accountId: number,
        @Query('date') date: number,
        @Query('shipId') shipId: number,
        @Query('battleType') battleType: BattleTypeEnum
    ): Promise<APIResponse<Battle[]>> {
        this.logger.info(`Get /api/battle with query {accountId: ${accountId}}`);
        try {
            const account = await this.accountService.getAccount(accountId);
            let battles: Battle[];
            let startTime: Date, endTime: Date;
            if (!date) {
                startTime = new Date(0);
                endTime = new Date();
            } else {
                [startTime, endTime] = this.dateService.getBothEnds(new Date(date));
            }
            const getOptions: GetBattleOptions = {
                startTime,
                endTime,
                ship: await this.shipService.getShip(shipId),
                battleType
            };
            battles = await this.battleService.getBattle(account, getOptions);
            this.logger.info(`APIController: Get ${battles.length} battle(s) of account ${accountId} success.`);
            return {
                status: 'success',
                data: battles
            };
        } catch (error) {
            this.logger.error('APIController: Error occurred when report group.');
            this.logger.error(error);
            return {
                status: 'failed',
                error: error.message
            };
        }
    }

    @Get('/statistics/:accountId')
    async getStatistics(
        @Param('accountId') accountId: number,
        @Query('startTime') startTime: number,
        @Query('endTime') endTime: number,
        @Query('shipId') shipId: number,
        @Query('battleType') battleType: BattleTypeEnum
    ): Promise<APIResponse<CalculatedBattle>> {
        this.logger.info(`Get /api/statistics with query {accountId: ${accountId}, startTime: ${startTime}, endTime: ${endTime}, shipId: ${shipId}, battleType: ${battleType}}`);
        try {
            const options: GetStatisticsOptions = {
                startTime: startTime ? new Date(startTime) : undefined,
                endTime: endTime ? new Date(endTime) : undefined,
                ship: await this.shipService.getShip(shipId),
                battleType
            };
            const account = await this.accountService.getAccount(accountId);
            const statistics = await this.statisticsCalculatorService.getStatistics(account, options);
            this.logger.info(`APIController: Get statistics of account ${accountId} success.`);
            return {
                status: 'success',
                data: statistics
            };
        } catch (error) {
            this.logger.error('APIController: Error occurred when get statistics.');
            this.logger.error(error);
            return {
                status: 'failed',
                error: error.message
            };
        }
    }

    @Get('/ship/:shipId')
    async getShip(@Param('shipId') shipId: number): Promise<APIResponse<Ship>> {
        this.logger.info(`Get /api/ship with query {shipId: ${shipId}}`);
        try {
            const ship = await this.shipService.getShip(shipId);
            this.logger.info(`APIController: Get ship ${shipId} success.`);
            return {
                status: 'success',
                data: ship
            };
        } catch (error) {
            this.logger.error('APIController: Error occurred when get ship.');
            this.logger.error(error);
            return {
                status: 'failed',
                error: error.message
            };
        }
    }
}
