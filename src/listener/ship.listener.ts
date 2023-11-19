import { Autoload, Singleton, Inject, Init } from "@midwayjs/core";
import { InjectEntityModel } from "@midwayjs/typeorm";
import { Repository } from "typeorm";
import { Ship, ShipTypeEnum } from "../model/ship.model";
import { HttpService } from "@midwayjs/axios";
import * as schedule from 'node-schedule';
import { APIRequestService } from "../service/apiRequest.service";
import { APIRequestTargetEnum } from "../types/apiRequest.types";

@Autoload()
@Singleton()
export class ShipListener {
    @InjectEntityModel('Ship')
    shipModel: Repository<Ship>;

    @Inject()
    httpService: HttpService;

    @Inject()
    apiRequestService: APIRequestService;

    private updateJob;

    @Init()
    async init() {
        this.updateJob = schedule.scheduleJob('0 0 3 * * *', async () => {
            await this.updateShips();
        });
    }

    async destory() {
        this.updateJob.cancel();
    }

    async createShip(...shipIds: number[]): Promise<Ship[]> {
        if (shipIds.length === 0) {
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
                console.log(`Failed to get ship info of shipId ${shipId}.`)
                ship.shipName = 'Unknown';
                ship.shipType = ShipTypeEnum.Destroyer;
                await this.shipModel.save(ship);
                return ship;
            }

            ship.shipName = shipInfo[shipId].name;
            ship.shipType = shipInfo[shipId].type;
            await this.shipModel.save(ship);
            return ship;
        }));
    }

    async updateShips() {
        try {
            const presentShipStatistics = (await this.httpService.get<AcquiredShipStatistics>(
                'https://api.wows-numbers.com/personal/rating/expected/json/',
            )).data;
            console.log(`Acquired ${Object.keys(presentShipStatistics.data).length} ships at ${presentShipStatistics.time}.`)
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
            await this.createShip(...shipIdsToCreate);
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
            console.error('Failed to update ships.');
            throw error;
        }
    }

    private async _queryShips(shipIds: number[]): Promise<ShipInfoQueryData> {
        try {
            const shipInfo = await this.apiRequestService.createQuery<{
                [shipId: number]: {
                    name: string;
                    type: ShipTypeEnum;
                }
            }>({
                requestTarget: APIRequestTargetEnum.Warships,
                ship_id: shipIds,
                fields: ['name', 'type'],
                language: 'zh-cn',
            }).query();
            return shipInfo.data;
        } catch (error) {
            console.error('Failed to query ships.');
            throw error;
        }

    }
}

interface AcquiredShipStatistics {
    time: number;
    data: {
        [shipId: number]: {
            average_damage_dealt: number;
            average_frags: number;
            win_rate: number;
        }
    }
}

interface ShipInfoQueryData {
    [shipId: number]: {
        name: string;
        type: ShipTypeEnum;
    }
}
