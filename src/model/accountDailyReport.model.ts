import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity()
export class AccountDailyReport {

    @PrimaryColumn()
    reportDate: number;

    @Column()
    accountId: number;

    @Column()
    numberOfBattles: number;

    @Column()
    winRate: number;

    @Column()
    maxDamageDealt: number;

    @Column()
    minDamageDealt: number;

    @Column()
    maxDamageScouting: number;

    @Column()
    minDamageScouting: number;

    @Column()
    maxDamagePotential: number;

    @Column()
    minDamagePotential: number;

    @Column()
    maxCapturePoints: number;

    @Column()
    minCapturePoints: number;

    @Column()
    maxCapturePointsDropped: number;

    @Column()
    minCapturePointsDropped: number;

    @Column()
    maxFragsTotal: number;

    @Column()
    minFragsTotal: number;

    @Column()
    maxPlanesKilled: number;

    @Column()
    minPlanesKilled: number;

    @Column()
    maxXp: number;

    @Column()
    minXp: number;

    @Column()
    maxFragsByMain: number;

    @Column()
    minFragsByMain: number;

    @Column()
    maxHitRateByMain: number;

    @Column()
    minHitRateByMain: number;

    @Column()
    maxFragsBySecondary: number;

    @Column()
    minFragsBySecondary: number;

    @Column()
    maxHitRateBySecondary: number;

    @Column()
    minHitRateBySecondary: number;

    @Column()
    maxFragsByTorpedoes: number;

    @Column()
    minFragsByTorpedoes: number;

    @Column()
    maxHitRateByTorpedoes: number;

    @Column()
    minHitRateByTorpedoes: number;

    @Column()
    averageDamageDealt: number;

    @Column()
    averageDamageScouting: number;

    @Column()
    averageDamagePotential: number;

    @Column()
    averageCapturePoints: number;

    @Column()
    averageCapturePointsDropped: number;

    @Column()
    averageFragsTotal: number;

    @Column()
    averagePlanesKilled: number;

    @Column()
    averageXp: number;

    @Column()
    averageFragsByMain: number;

    @Column()
    averageHitRateByMain: number;

    @Column()
    averageFragsBySecondary: number;

    @Column()
    averageHitRateBySecondary: number;

    @Column()
    averageFragsByTorpedoes: number;

    @Column()
    averageHitRateByTorpedoes: number;
}