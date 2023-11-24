import { Entity, ManyToOne, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Group } from './group.model';
import { Account } from './account.model';

@Entity()
export class GroupDailyReport {

    @PrimaryGeneratedColumn()
    reportId: number;

    @Column({ type: 'date' })
    reportTime: Date;

    @ManyToOne(type => Group, group => group.dailyReport)
    group: Group;

    @ManyToOne(type => Account, account => account.actorOfTheDay)
    actorOfTheDay: Account;

    @ManyToOne(type => Account, account => account.prisonerOfWarOfTheDay)
    prisonerOfWarOfTheDay: Account;

    @ManyToOne(type => Account, account => account.scoutBoyOfTheDay)
    scoutBoyOfTheDay: Account;

    @ManyToOne(type => Account, account => account.damageBoyOfTheDay)
    damageBoyOfTheDay: Account;

    @ManyToOne(type => Account, account => account.antiAirBoyOfTheDay)
    antiAirBoyOfTheDay: Account;

    @ManyToOne(type => Account, account => account.fragBoyOfTheDay)
    fragBoyOfTheDay: Account;

}
