import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User.entity';

@Entity('teachers') 
export class Teacher {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => User, { nullable: false })
    @JoinColumn({ name: 'user_ID' })
    user: User;

    @Column({nullable: true})
    subject: string;

    @Column({nullable: true})
    qualification: string;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;

    @Column({ nullable: true })
    created_by: string;

    @Column({ nullable: true })
    updated_by: string;
}