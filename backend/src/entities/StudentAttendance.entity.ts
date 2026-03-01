import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from './Student.entity';
import { Class } from './Class.entity';
import { Teacher } from './Teacher.entity';

export enum AttendanceStatus {
    PRESENT = 'present',
    ABSENT = 'absent',
    LATE = 'late',
    UNCERTAIN = 'uncertain',
    SICK = 'sick',
    LEAVE = 'leave',
    EXCUSED = 'excused'
}

@Entity('student_attendances') 
export class StudentAttendance {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Student, { nullable: false })
    @JoinColumn({ name: 'student_ID', referencedColumnName: 'student_ID' })
    student: Student;

    @ManyToOne(() => Class, { nullable: false })
    @JoinColumn({ name: 'class_ID' })
    class: Class;

    @Column({ type: 'date', nullable: false })
    date: Date;

    @Column({
        type: 'enum',
        enum: AttendanceStatus,
        default: AttendanceStatus.PRESENT
    })
    status: AttendanceStatus;

    @Column({ type: 'text', nullable: true })
    reason: string | null;

    @Column({ nullable: true })
    proof_file: string;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @ManyToOne(() => Teacher, { nullable: false })
    @JoinColumn({ name: 'recorded_by' })
    recordedBy: Teacher;

    @Column({ type: 'timestamp', nullable: false })
    recorded_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;

    @Column({ nullable: true })
    created_by: string;

    @Column({ nullable: true })
    updated_by: string;
    
}
