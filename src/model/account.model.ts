import { Column, Entity, ManyToMany, OneToMany, PrimaryColumn } from 'typeorm';
import { Group } from './group.model';
import { Ship } from './ship.model';
import { Battle } from './battle.model';

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

}
