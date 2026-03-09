import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TeachingSchedule } from './TeachingSchedule.entity';

@Entity('rph')
export class RPH {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => TeachingSchedule, teachingSchedule => teachingSchedule.rph, { nullable: false })
    @JoinColumn({ name: 'teaching_schedule_id', referencedColumnName: 'id' })
    teachingSchedule: TeachingSchedule;

    @Column()
    subject: string;

    @Column()
    year: string;

    @Column()
    day: string;

    @Column({ type: 'date' })
    date: Date;

    @Column({ type: 'int', nullable: true })
    week: number;

    @Column({ type: 'int', nullable: true })
    lesson: number;

    @Column({ type: 'time', nullable: true })
    time_start: string;

    @Column({ type: 'time', nullable: true })
    time_end: string;

    @Column({ nullable: true })
    duration: string; // e.g. "30 minutes"

    // Lesson Details
    @Column({ nullable: true })
    theme: string;

    @Column({ nullable: true })
    topic: string;

    @Column({ nullable: true })
    focus_skills_main: string;

    @Column({ nullable: true })
    focus_skills_complementary: string;

    @Column({ type: 'text', nullable: true })
    content_standard_main: string;

    @Column({ type: 'text', nullable: true })
    content_standard_complementary: string;

    @Column({ type: 'text', nullable: true })
    learning_standard_main: string;

    @Column({ type: 'text', nullable: true })
    learning_standard_complementary: string;

    @Column({ type: 'text', nullable: true })
    learning_objectives: string;

    @Column({ type: 'text', nullable: true })
    success_criteria: string;

    @Column({ nullable: true })
    language_focus: string;

    @Column({ nullable: true })
    grammar_focus: string;

    @Column({ type: 'text', nullable: true })
    activities_pre_lesson: string;

    @Column({ type: 'text', nullable: true })
    activities_lesson_development: string;

    @Column({ type: 'text', nullable: true })
    activities_post_lesson: string;

    @Column({ type: 'text', nullable: true })
    teaching_aids: string;

    @Column({ nullable: true })
    method: string;

    @Column({ nullable: true })
    assessment: string;

    @Column({ type: 'text', nullable: true })
    reflection: string;

    @Column({ type: 'text', nullable: true })
    observation: string;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;

    @Column({ nullable: true })
    created_by: string;

    @Column({ nullable: true })
    updated_by: string;
    
}
