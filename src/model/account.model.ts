import { Column, Entity, ManyToMany, OneToMany, PrimaryColumn } from 'typeorm';
import { Group } from './group.model';
import { Ship } from './ship.model';
import { Battle } from './battle.model';
import { GroupDailyReport } from './groupDailyReport.model';

@Entity()
export class Account {

    @PrimaryColumn()
    accountId: number;

    @Column()
    nickName: string;

    @Column({
        nullable: true,
        default: null,
    })
    qqId: number;

    @Column({
        default: 0,
    })
    lastUpdatedTime: number; // 最后一次检查到Battle数据更新的时间

    @Column({
        nullable: true,
        default: null,
    })
    accessToken: string;

    @Column({
        nullable: true,
        default: null,
    })
    accessTokenExpireTime: number;

    @ManyToMany(type => Group, group => group.accounts)
    groups: Group[];

    @ManyToMany(type => Ship, ship => ship.accounts)
    ships: Ship[];

    @OneToMany(type => Battle, battle => battle.account)
    battles: Battle[];

    @OneToMany(type => GroupDailyReport, groupDailyReport => groupDailyReport.actorOfTheDay)
    actorOfTheDay: GroupDailyReport[];

    @OneToMany(type => GroupDailyReport, groupDailyReport => groupDailyReport.prisonerOfWarOfTheDay)
    prisonerOfWarOfTheDay: GroupDailyReport[];

    @OneToMany(type => GroupDailyReport, groupDailyReport => groupDailyReport.scoutBoyOfTheDay)
    scoutBoyOfTheDay: GroupDailyReport[];

    @OneToMany(type => GroupDailyReport, groupDailyReport => groupDailyReport.damageBoyOfTheDay)
    damageBoyOfTheDay: GroupDailyReport[];

    @OneToMany(type => GroupDailyReport, groupDailyReport => groupDailyReport.antiAirBoyOfTheDay)
    antiAirBoyOfTheDay: GroupDailyReport[];

    @OneToMany(type => GroupDailyReport, groupDailyReport => groupDailyReport.fragBoyOfTheDay)
    fragBoyOfTheDay: GroupDailyReport[];
}
