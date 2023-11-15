import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Battle {
    
    @PrimaryGeneratedColumn()
    battleId: number;

    @Column()
    accountId: number;

    @Column()
    shipId: number;

    @Column()
    battleTime: number;

    @Column()
    numberOfBattles: number;

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