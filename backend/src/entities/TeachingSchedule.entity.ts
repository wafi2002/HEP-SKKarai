import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { Teacher } from './Teacher.entity';
import { Class } from './Class.entity';

export enum DayOfWeek {
    MONDAY = 'Monday',
    TUESDAY = 'Tuesday',
    WEDNESDAY = 'Wednesday',
    THURSDAY = 'Thursday',
    FRIDAY = 'Friday',
    SATURDAY = 'Saturday',
    SUNDAY = 'Sunday'
}

@Entity('teaching_schedules') 
export class TeachingSchedule {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Teacher, { nullable: false })
    @JoinColumn({ name: 'teacher_ID' })
    teacher: Teacher;

    @ManyToOne(() => Class, { nullable: false })
    @JoinColumn({ name: 'class_ID' })
    class: Class;

    @Column({
        type: 'enum',
        enum: DayOfWeek,
        nullable: false
    })
    day_of_week: DayOfWeek;

    @Column({type: 'time', nullable: true})
    start_time: Date;

    @Column({type: 'time',nullable: true})
    end_time: Date;

    // Period to take attendance
    @Column({ nullable: true })
    subject: String;

    @CreateDateColumn({ type: 'timestamp' })    
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;

    @Column({ nullable: true })
    created_by: string;

    @Column({ nullable: true })
    updated_by: string;
    
}
