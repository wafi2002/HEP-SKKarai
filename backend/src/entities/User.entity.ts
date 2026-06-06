import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserGroup } from './UserGroup.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    username: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column()
    role: string;

    @Column({ nullable: true })
    user_group_id: string;

    @ManyToOne(() => UserGroup, { nullable: true, eager: true })
    @JoinColumn({ name: 'user_group_id' })
    userGroup: UserGroup;
}
