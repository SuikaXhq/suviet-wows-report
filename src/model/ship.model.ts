import { Entity, PrimaryColumn, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Account } from './account.model';
import { Battle } from './battle.model';

@Entity()
export class Ship {

    @PrimaryColumn()
    shipId: number;

    @Column()
    shipType: ShipTypeEnum;

    @Column('real')
    averageDamage: number;

    @Column('real')
    averageWinRate: number;

    @Column('real')
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
