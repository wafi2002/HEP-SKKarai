import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Class } from "./Class.entity";
import { Teacher } from "./Teacher.entity";

@Entity('attendance_sessions')
export class AttendanceSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Class)
  @JoinColumn({ name: 'class_ID' })
  class: Class;

  @Column({ type: 'date' })
  date: Date;

  @ManyToOne(() => Teacher)
  @JoinColumn({ name: 'recorded_by' })
  recordedBy: Teacher;

  @CreateDateColumn()
  created_at: Date;
}