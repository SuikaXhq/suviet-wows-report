import { Entity, PrimaryColumn, Column, ManyToMany, JoinTable, OneToMany, UpdateDateColumn } from 'typeorm';
import { Account } from './account.model';
import { Battle } from './battle.model';

@Entity()
export class Ship {

    @PrimaryColumn()
    shipId: number;

    @UpdateDateColumn()
    updatedDate: Date;

    @Column()
    shipType: string;

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
