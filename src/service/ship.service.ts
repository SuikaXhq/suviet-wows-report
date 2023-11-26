import { ILogger, Inject, Provide } from "@midwayjs/core";
import { InjectEntityModel } from "@midwayjs/typeorm";
import { Ship } from "../model/ship.model";
import { Repository } from "typeorm";

@Provide()
export class ShipService {
    @Inject()
    logger: ILogger;

    @InjectEntityModel(Ship)
    shipModel: Repository<Ship>;

    async getShip(shipId: number): Promise<Ship> {
        return await this.shipModel.findOne({
            where: {
                shipId
            }
        });
    }
}
