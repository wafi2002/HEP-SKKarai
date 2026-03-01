import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, OneToOne, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { StudentAcademic } from './StudentAcademic.entity';
import { GuardianOrder, Parent } from './Parent.entity';
import { Address } from './Address.entity';
import { Class } from './Class.entity';

@Entity('students')
export class Student {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    student_ID: string;

    @Column({ nullable: true })
    name: string;

    @Column({ unique: true })
    ic: string;

    @Column({ nullable: true })
    identity_type: string;

    @Column({ nullable: true })
    birthdate: Date;

    @Index()
    @Column({ nullable: true })
    gender: string;

    @Column({ nullable: true })
    race: string;

    @Column({ nullable: true })
    religion: string;

    @Column({ nullable: true })
    citizenship: string;

    @Column({ nullable: true })
    origin_country: string;

    @Index()
    @Column({
        type: 'int',
        nullable: true,
        comment: '1 = Ya, 2 = Tidak'
    })
    orphan_status: number;

    @Column({ nullable: true })
    account_bank_no:  string;

    @Column({ nullable: true })
    account_bank_name: string;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;

    @Column({ nullable: true })
    created_by: string;

    @Column({ nullable: true })
    updated_by: string;

    @OneToOne(() => StudentAcademic, (academic) => academic.student)
    academic: StudentAcademic;

    @OneToMany(() => Parent, parent => parent.student)
    parents: Parent[];

    @OneToOne(() => Address, address => address.student)
    address: Address;
    
    // Helper methods
    getPrimaryGuardian(): Parent | undefined {
        return this.parents?.find(p => p.guardian_order === GuardianOrder.PRIMARY);
    }
    
    getSecondaryGuardian(): Parent | undefined {
        return this.parents?.find(p => p.guardian_order === GuardianOrder.SECONDARY);
    }
    
}
