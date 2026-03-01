import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { StudentAcademic } from './StudentAcademic.entity';

@Entity('classes')
@Index(['class_name', 'academic_year_level'], { unique: true }) // Prevent duplicate class names
export class Class {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: false })
    class_name: string;

    @Column({ nullable: true })
    class_type: string;

    @Column({ nullable: false })
    academic_year_level: string;

    @Column({ nullable: true })
    class_teacher_name: string;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;

    @Column({ nullable: true })
    created_by: string;

    @Column({ nullable: true })
    updated_by: string;

    @OneToMany(() => StudentAcademic, academic => academic.class)
    studentAcademics: StudentAcademic[];
}