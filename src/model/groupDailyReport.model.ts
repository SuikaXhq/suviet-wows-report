import { Entity, OneToOne, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Group } from './group.model';
import { Battle } from './battle.model';

@Entity()
export class GroupDailyReport {

    @PrimaryGeneratedColumn()
    reportId: number;

    @Column({
        type: 'date',
        unique: true,
    })
    reportTime: number;

    @ManyToOne(type => Group, group => group.dailyReport)
    group: Group;

    @OneToOne(type => Battle, battle => battle.actorOfTheDay)
    @JoinColumn()
    actorOfTheDay: Battle;

    @OneToOne(type => Battle, battle => battle.prisonerOfWarOfTheDay)
    @JoinColumn()
    prisonerOfWarOfTheDay: Battle;

    @OneToOne(type => Battle, battle => battle.scoutBoyOfTheDay)
    @JoinColumn()
    scoutBoyOfTheDay: Battle;

    @OneToOne(type => Battle, battle => battle.damageBoyOfTheDay)
    @JoinColumn()
    damageBoyOfTheDay: Battle;

    @OneToOne(type => Battle, battle => battle.antiAirBoyOfTheDay)
    @JoinColumn()
    antiAirBoyOfTheDay: Battle;

    @OneToOne(type => Battle, battle => battle.fragBoyOfTheDay)
    @JoinColumn()
    fragBoyOfTheDay: Battle;

}
