import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Account } from './account.model';
import { GroupDailyReport } from './groupDailyReport.model';

@Entity()
export class Group {

    @PrimaryGeneratedColumn()
    groupId: number;

    @Column()
    groupName: string;

    @ManyToMany(type => Account, account => account.groups)
    @JoinTable()
    accounts: Account[];

    @OneToMany(type => GroupDailyReport, groupDailyReport => groupDailyReport.group)
    dailyReport: GroupDailyReport[];
}
