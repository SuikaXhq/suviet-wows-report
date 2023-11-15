import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
export class Ship {

    @PrimaryColumn()
    shipId: number;
    
    @Column()
    shipType: string;

    @Column()
    averageDamage: number;

    @Column()
    averageWinRate: number;

    @Column()
    averageFrags: number;
}