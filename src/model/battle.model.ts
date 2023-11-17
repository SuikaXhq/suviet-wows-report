import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Account } from './account.model';
import { Ship } from './ship.model';

@Entity()
export class Battle {

    @PrimaryGeneratedColumn()
    battleId: number;

    @ManyToOne(type => Account, account => account.battles)
    account: Account;

    @ManyToOne(type => Ship, ship => ship.battles)
    ship: Ship;

    @Column('date')
    battleTime: Date;

    @Column()
    numberOfBattles: number;

    @Column()
    numberOfSolo: number;

    @Column()
    numberOfDiv2: number;

    @Column()
    numberOfDiv3: number;

    @Column()
    isWin: boolean;

    @Column()
    damageDealt: number;

    @Column()
    damageScouting: number;

    @Column()
    damagePotential: number;

    @Column()
    capturePoints: number;

    @Column()
    capturePointsDropped: number;

    @Column()
    fragsTotal: number;

    @Column()
    planesKilled: number;

    @Column()
    isSurvived: boolean;

    @Column()
    xp: number;

    @Column()
    fragsByMain: number;

    @Column()
    hitRateByMain: number;

    @Column()
    fragsBySecondary: number;

    @Column()
    hitRateBySecondary: number;

    @Column()
    fragsByTorpedoes: number;

    @Column()
    hitRateByTorpedoes: number;

}
