import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Account {

    @PrimaryColumn()
    accoundId: number;

    @Column()
    nickName: string;

    @Column()
    QQId: number;

    @Column()
    accessToken: string;

    @Column()
    accessTokenExpireTime: number;
}