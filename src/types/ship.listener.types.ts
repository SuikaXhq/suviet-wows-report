import { ShipTypeEnum } from "../model/ship.model";

export interface AcquiredShipStatistics {
    time: number;
    data: {
        [shipId: number]: {
            average_damage_dealt: number;
            average_frags: number;
            win_rate: number;
        }
    }
}

export interface ShipInfoQueryData {
    [shipId: number]: {
        name: string;
        type: ShipTypeEnum;
    }
}
