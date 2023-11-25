import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne } from 'typeorm';
import { Account } from './account.model';
import { Ship } from './ship.model';
import { GroupDailyReport } from './groupDailyReport.model';

@Entity()
export class Battle {

    @PrimaryGeneratedColumn()
    battleId: number;

    @ManyToOne(type => Account, account => account.battles)
    account: Account;

    @ManyToOne(type => Ship, ship => ship.battles)
    ship: Ship;

    @Column()
    battleTime: number;

    @Column()
    battleType: BattleTypeEnum; // PVP_SOLO, PVP_DIV2, PVP_DIV3, RANK_SOLO, RANK_DIV2, RANK_DIV3

    @Column()
    numberOfBattles: number;

    @Column()
    wins: number;

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
    survives: number;

    @Column()
    xp: number;

    @Column()
    fragsByMain: number;

    @Column()
    hitsByMain: number;

    @Column()
    shotsByMain: number;

    @Column()
    fragsBySecondary: number;

    @Column()
    hitsBySecondary: number;

    @Column()
    shotsBySecondary: number;

    @Column()
    fragsByTorpedoes: number;

    @Column()
    hitsByTorpedoes: number;

    @Column()
    shotsByTorpedoes: number;

    @Column()
    fragsByRamming: number;

    @Column()
    fragsByAircraft: number;

    @OneToOne(type => GroupDailyReport, groupDailyReport => groupDailyReport.actorOfTheDay)
    actorOfTheDay: GroupDailyReport;

    @OneToOne(type => GroupDailyReport, groupDailyReport => groupDailyReport.prisonerOfWarOfTheDay)
    prisonerOfWarOfTheDay: GroupDailyReport;

    @OneToOne(type => GroupDailyReport, groupDailyReport => groupDailyReport.scoutBoyOfTheDay)
    scoutBoyOfTheDay: GroupDailyReport;

    @OneToOne(type => GroupDailyReport, groupDailyReport => groupDailyReport.damageBoyOfTheDay)
    damageBoyOfTheDay: GroupDailyReport;

    @OneToOne(type => GroupDailyReport, groupDailyReport => groupDailyReport.antiAirBoyOfTheDay)
    antiAirBoyOfTheDay: GroupDailyReport;

    @OneToOne(type => GroupDailyReport, groupDailyReport => groupDailyReport.fragBoyOfTheDay)
    fragBoyOfTheDay: GroupDailyReport;

    static createEmptyBattle(): CalculatedBattle {
        const battle = new Battle();
        battle.account = null;
        battle.ship = null;
        battle.battleTime = null;
        battle.battleId = null;
        battle.battleType = null;
        battle.numberOfBattles = 0;
        battle.wins = 0;
        battle.damageDealt = 0;
        battle.damageScouting = 0;
        battle.damagePotential = 0;
        battle.capturePoints = 0;
        battle.capturePointsDropped = 0;
        battle.fragsTotal = 0;
        battle.planesKilled = 0;
        battle.survives = 0;
        battle.xp = 0;
        battle.fragsByMain = 0;
        battle.fragsBySecondary = 0;
        battle.fragsByTorpedoes = 0;
        battle.fragsByRamming = 0;
        battle.fragsByAircraft = 0;
        battle.hitsByMain = 0;
        battle.hitsBySecondary = 0;
        battle.hitsByTorpedoes = 0;
        battle.shotsByMain = 0;
        battle.shotsBySecondary = 0;
        battle.shotsByTorpedoes = 0;
        return battle;
    }

    /**
     * 将多个Battle数据加和生成一个Battle，无视battleId, account, ship, battleTime, battleType属性
     * @param battles
     * @returns 数据合并后的Battle
     */
    static mergeBattles(battles: (CalculatedBattle | Battle)[]): CalculatedBattle {
        if (battles.length === 0) {
            return Battle.createEmptyBattle();
        }
        let newBattle: CalculatedBattle = Battle.createEmptyBattle();
        battles.forEach(battle => {
            newBattle.numberOfBattles += battle.numberOfBattles;
            newBattle.wins += battle.wins;
            newBattle.damageDealt += battle.damageDealt;
            newBattle.damageScouting += battle.damageScouting;
            newBattle.damagePotential += battle.damagePotential;
            newBattle.capturePoints += battle.capturePoints;
            newBattle.capturePointsDropped += battle.capturePointsDropped;
            newBattle.fragsTotal += battle.fragsTotal;
            newBattle.planesKilled += battle.planesKilled;
            newBattle.survives += battle.survives;
            newBattle.xp += battle.xp;
            newBattle.fragsByMain += battle.fragsByMain;
            newBattle.fragsBySecondary += battle.fragsBySecondary;
            newBattle.fragsByTorpedoes += battle.fragsByTorpedoes;
            newBattle.fragsByRamming += battle.fragsByRamming;
            newBattle.fragsByAircraft += battle.fragsByAircraft;
            newBattle.hitsByMain += battle.hitsByMain;
            newBattle.hitsBySecondary += battle.hitsBySecondary;
            newBattle.hitsByTorpedoes += battle.hitsByTorpedoes;
            newBattle.shotsByMain += battle.shotsByMain;
            newBattle.shotsBySecondary += battle.shotsBySecondary;
            newBattle.shotsByTorpedoes += battle.shotsByTorpedoes;
        });
        return newBattle;
    }

    /**
     * 将新的Battle与旧的Battle相减，无视battleId, account, ship, battleTime, battleType属性
     * @param newBattle
     * @param oldBattle
     * @returns newBattle - oldBattle
     */
    static substractBattle(newBattle: CalculatedBattle | Battle, oldBattle: CalculatedBattle | Battle): CalculatedBattle {
        return {
            numberOfBattles: newBattle.numberOfBattles - oldBattle.numberOfBattles,
            wins: newBattle.wins - oldBattle.wins,
            damageDealt: newBattle.damageDealt - oldBattle.damageDealt,
            damageScouting: newBattle.damageScouting - oldBattle.damageScouting,
            damagePotential: newBattle.damagePotential - oldBattle.damagePotential,
            capturePoints: newBattle.capturePoints - oldBattle.capturePoints,
            capturePointsDropped: newBattle.capturePointsDropped - oldBattle.capturePointsDropped,
            fragsTotal: newBattle.fragsTotal - oldBattle.fragsTotal,
            planesKilled: newBattle.planesKilled - oldBattle.planesKilled,
            survives: newBattle.survives - oldBattle.survives,
            xp: newBattle.xp - oldBattle.xp,
            fragsByMain: newBattle.fragsByMain - oldBattle.fragsByMain,
            fragsBySecondary: newBattle.fragsBySecondary - oldBattle.fragsBySecondary,
            fragsByTorpedoes: newBattle.fragsByTorpedoes - oldBattle.fragsByTorpedoes,
            fragsByRamming: newBattle.fragsByRamming - oldBattle.fragsByRamming,
            fragsByAircraft: newBattle.fragsByAircraft - oldBattle.fragsByAircraft,
            hitsByMain: newBattle.hitsByMain - oldBattle.hitsByMain,
            hitsBySecondary: newBattle.hitsBySecondary - oldBattle.hitsBySecondary,
            hitsByTorpedoes: newBattle.hitsByTorpedoes - oldBattle.hitsByTorpedoes,
            shotsByMain: newBattle.shotsByMain - oldBattle.shotsByMain,
            shotsBySecondary: newBattle.shotsBySecondary - oldBattle.shotsBySecondary,
            shotsByTorpedoes: newBattle.shotsByTorpedoes - oldBattle.shotsByTorpedoes,
        }
    }

}

export type CalculatedBattle = Omit<Battle,
    | 'battleId'
    | 'account'
    | 'ship'
    | 'battleTime'
    | 'battleType'
    | 'actorOfTheDay'
    | 'prisonerOfWarOfTheDay'
    | 'fragBoyOfTheDay'
    | 'damageBoyOfTheDay'
    | 'antiAirBoyOfTheDay'
    | 'scoutBoyOfTheDay'>;

export enum BattleTypeEnum {
    PVP_SOLO = 'pvp_solo',
    PVP_DIV2 = 'pvp_div2',
    PVP_DIV3 = 'pvp_div3',
    // RANK_SOLO = 'rank_solo',
    // RANK_DIV2 = 'rank_div2',
    // RANK_DIV3 = 'rank_div3',
    // PVE = 'pve',
    // OPER = 'oper',
    // CLUB = 'club',
}
