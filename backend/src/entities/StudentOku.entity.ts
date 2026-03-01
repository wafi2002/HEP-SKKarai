import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, OneToOne, JoinColumn } from 'typeorm';
import { Student } from './Student.entity';


@Entity('student_okus')
export class StudentOku {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => Student)
    @JoinColumn({ name: 'student_ID', referencedColumnName: 'student_ID' })
    student: Student;

    @Column({ nullable: true })
    oku_status: boolean;

    @Column({ nullable: true })
    oku_approved_date: Date;

    @Column({ nullable: true })
    oku_registration_no: string;

    @Column({ nullable: true })
    oku_registration_date: Date;

    @Column({ nullable: true })
    oku_card_date: Date;

    @Column({ nullable: true })
    oku_category_type: string; 

    @Column({ nullable: true })
    oku_subcategory_type: string; 

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;

    @Column({ nullable: true })
    created_by: string;

    @Column({ nullable: true })
    updated_by: string;
    
}
