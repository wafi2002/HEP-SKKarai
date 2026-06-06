import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SystemFunction } from './SystemFunction.entity';

@Entity('permissions')
export class Permission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @ManyToOne(() => SystemFunction, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'function_id' })
    function: SystemFunction;

    @Column()
    function_id: string;
}
