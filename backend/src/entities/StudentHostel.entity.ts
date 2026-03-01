import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, OneToOne, JoinColumn } from 'typeorm';
import { Student } from './Student.entity';

@Entity('student_hostels')
export class StudentHostel {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => Student)
    @JoinColumn({ name: 'student_ID', referencedColumnName: 'student_ID' })
    student: Student;

    @Column({ nullable: true })
    hostel_status: string;

    @Index()
    @Column({ nullable: true })
    hostel_name: string;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;

    @Column({ nullable: true })
    created_by: string;

    @Column({ nullable: true })
    updated_by: string;
    
}
