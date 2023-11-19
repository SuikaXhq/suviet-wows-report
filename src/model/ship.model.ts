import { Entity, PrimaryColumn, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Account } from './account.model';
import { Battle } from './battle.model';

@Entity()
export class Ship {

    @PrimaryColumn()
    shipId: number;

    @Column({
        default: 0,
    })
    lastUpdateTime: number;

    @Column()
    shipName: string;

    @Column()
    shipType: ShipTypeEnum;

    @Column('real', {
        nullable: true,
        default: null,
    })
    averageDamage: number;

    @Column('real', {
        nullable: true,
        default: null,
    })
    averageWinRate: number;

    @Column('real', {
        nullable: true,
        default: null,
    })
    averageFrags: number;

    @ManyToMany(type => Account, account => account.ships)
    @JoinTable()
    accounts: Account[];

    @OneToMany(type => Battle, battle => battle.ship)
    battles: Battle[];
}

export enum ShipTypeEnum {
    Destroyer = 'Destroyer',
    Cruiser = 'Cruiser',
    Battleship = 'Battleship',
    AirCarrier = 'AirCarrier',
    Submarine = 'Submarine',
}
