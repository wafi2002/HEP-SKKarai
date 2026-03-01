import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Student } from './Student.entity';

@Entity('addresses')
export class Address {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => Student)
    @JoinColumn({ name: 'student_ID', referencedColumnName: 'student_ID' })
    student: Student;

    @Column({ nullable: true })
    address_1: string;

    @Column({ nullable: true })
    address_2: string;

    @Column({ nullable: true })
    address_3: string;

    @Column({ nullable: true })
    postcode: string;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    region: string;

    @Column({ nullable: true })
    state: string;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;

    @Column({ nullable: true })
    created_by: string;

    @Column({ nullable: true })
    updated_by: string;
    
}
