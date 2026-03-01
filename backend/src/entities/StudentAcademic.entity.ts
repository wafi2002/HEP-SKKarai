import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { Student } from './Student.entity';
import { Class } from './Class.entity';

@Entity('student_academics') 
export class StudentAcademic {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => Student)
    @JoinColumn({ name: 'student_ID', referencedColumnName: 'student_ID' })
    student: Student;

    @Column({ nullable: true })
    study_status: string;

    @Index()
    @Column({ nullable: true })
    school_enrollment_date: Date;

    @Index()
    @Column({ nullable: true })
    class_enrollment_date: Date;

    @ManyToOne(() => Class, academic => academic.studentAcademics, { nullable: true })
    @JoinColumn({ name: 'class_ID' })
    class: Class;

    @Index()
    @Column({ nullable: true })
    dlp_status: string;

    @Column({ nullable: true })
    stream_desc: string;

    @Column({ nullable: true })
    field_desc: string;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;

    @Column({ nullable: true })
    created_by: string;

    @Column({ nullable: true })
    updated_by: string;
    
}
