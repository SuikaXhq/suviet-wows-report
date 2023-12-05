import { Autoload, Singleton, Inject, Init, ILogger } from "@midwayjs/core";
import { InjectEntityModel } from "@midwayjs/typeorm";
import { Repository } from "typeorm";
import { Ship, ShipTypeEnum } from "../model/ship.model";
import { HttpService } from "@midwayjs/axios";
import * as schedule from 'node-schedule';
import { APIRequestService } from "../service/apiRequest.service";
import { APIRequestTargetEnum } from "../types/apiRequest.types";
import { ShipNameConvertService } from "../service/shipNameConvert.service";
import { ShipInfoQueryData, AcquiredShipStatistics } from "../types/ship.listener.types";

@Autoload()
@Singleton()
export class ShipListener {
    @InjectEntityModel('Ship')
    shipModel: Repository<Ship>;

    @Inject()
    httpService: HttpService;

    @Inject()
    apiRequestService: APIRequestService;

    @Inject()
    shipNameConvertService: ShipNameConvertService;

    @Inject()
    logger: ILogger;

    private updateJob;

    @Init()
    async init() {
        this.logger.info('ShipListener: initializing.');
        await this.updateShips();
        this.updateJob = schedule.scheduleJob('0 0 3 * * *', async () => {
            await this.updateShips();
        });
    }

    async destory() {
        this.updateJob.cancel();
        this.logger.info('ShipListener: schedule cancelled.');
    }

    async createShip(...shipIds: number[]): Promise<Ship[]> {
        if (shipIds.length === 0) {
            this.logger.warn('ShipListener: createShip() called with no shipIds.');
            return [];
        }
        // 获取船只名字以及类型
        let shipInfo: ShipInfoQueryData;
        if (shipIds.length > 100) {
            let index = 0;
            while (index < shipIds.length) {
                const shipInfoPart = await this._queryShips(shipIds.slice(index, index + 100));
                if (shipInfo === undefined) {
                    shipInfo = shipInfoPart;
                } else {
                    shipInfo = {
                        ...shipInfo,
                        ...shipInfoPart,
                    };
                }
                index += 100;
            }
        } else {
            shipInfo = await this._queryShips(shipIds);
        }

        return await Promise.all(shipIds.map(async shipId => {
            const ship = new Ship();
            ship.shipId = shipId;
            ship.lastUpdateTime = 0;
            ship.averageDamage = null;
            ship.averageFrags = null;
            ship.averageWinRate = null;

            if (shipInfo[shipId] === undefined || shipInfo[shipId] === null) {
                this.logger.warn(`ShipListener: Failed to get ship info of shipId ${shipId}, inserting Unknown items.`);
                ship.shipName = 'Unknown';
                ship.shipType = ShipTypeEnum.Destroyer;
                ship.tier = 0;
                await this.shipModel.save(ship);
                return ship;
            }

            ship.shipName = await this.shipNameConvertService.convertShipName(shipInfo[shipId].name);
            ship.shipType = shipInfo[shipId].type;
            ship.tier = shipInfo[shipId].tier;
            await this.shipModel.save(ship);
            return ship;
        }));
    }

    async updateShips() {
        try {
            const presentShipStatistics = (await this.httpService.get<AcquiredShipStatistics>(
                'https://api.wows-numbers.com/personal/rating/expected/json/',
            )).data;
            this.logger.info(`ShipListener: Acquired ${Object.keys(presentShipStatistics.data).length} ships at timestamp ${presentShipStatistics.time}.`);
            const lastUpdateTime = presentShipStatistics.time;

            let shipIdsToCreate: number[] = [];
            await Promise.all(Object.keys(presentShipStatistics.data).map(async shipIdString => {
                const shipId = parseInt(shipIdString);
                let ship = await this.shipModel.findOne({
                    where: {
                        shipId: shipId,
                    }
                });
                if (ship === undefined || ship === null) {
                    shipIdsToCreate.push(shipId);
                }
            }));
            if (shipIdsToCreate.length > 0) {
                await this.createShip(...shipIdsToCreate);
            }
            await Promise.all(Object.keys(presentShipStatistics.data).map(async shipIdString => {
                const shipId = parseInt(shipIdString);
                const statistics = presentShipStatistics.data[shipId];
                let ship = await this.shipModel.findOne({
                    where: {
                        shipId: shipId,
                    }
                });
                ship.lastUpdateTime = lastUpdateTime;
                ship.averageDamage = statistics.average_damage_dealt;
                ship.averageFrags = statistics.average_frags;
                ship.averageWinRate = statistics.win_rate;
                await this.shipModel.save(ship);
            }));
        } catch (error) {
            this.logger.error('ShipListener: Failed to update ships.');
            this.logger.error(error);
            throw error;
        }
    }

    private async _queryShips(shipIds: number[]): Promise<ShipInfoQueryData> {
        try {
            const shipInfo = await this.apiRequestService.createQuery<ShipInfoQueryData>({
                requestTarget: APIRequestTargetEnum.Warships,
                ship_id: shipIds,
                fields: ['name', 'type', 'tier'],
                language: 'zh-cn',
            }).query();
            return shipInfo.data;
        } catch (error) {
            this.logger.error('ShipListener: Failed to query ships.');
            this.logger.error(error);
            throw error;
        }

    }
}
