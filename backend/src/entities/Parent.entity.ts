import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from './Student.entity';

export enum GuardianOrder {
    PRIMARY = 'primary',    // Penjaga 1
    SECONDARY = 'secondary' // Penjaga 2
}

export enum IdentityType {
    IC = 'KAD PENGENALAN',
    PASSPORT = 'PASSPORT',
    BIRTH_CERT = 'SIJIL LAHIR'
}

@Entity('parents')
export class Parent {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Student, student => student.parents, { nullable: false })
    @JoinColumn({ name: 'student_ID', referencedColumnName: 'student_ID' })
    student: Student;

    @Column({
        type: 'enum',
        enum: GuardianOrder,
        nullable: false
    })
    guardian_order: GuardianOrder; // primary atau secondary

    @Column({ nullable: true })
    guardian_name: string;

    @Column({
        type: 'enum',
        enum: IdentityType,
        default: IdentityType.IC
    })
    identity_type: IdentityType;

    @Column({ nullable: true })
    ic: string;

    @Column({ nullable: true })
    relation: string;

    @Column({ nullable: true })
    occupation: string;

    @Column({ nullable: true })
    occupation_status: string;

    @Column({ nullable: true })
    employer_name: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    income: number;

    @Column({ nullable: true })
    office_phone_no: string;

    @Column({ nullable: true })
    mobile_phone_no: string;

    @Column({ type: 'int', nullable: true, default: 0 })
    no_of_dependents: number;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;

    @Column({ nullable: true })
    created_by: string;

    @Column({ nullable: true })
    updated_by: string;
    
}
