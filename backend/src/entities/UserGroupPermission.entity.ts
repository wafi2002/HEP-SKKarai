import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { UserGroup } from './UserGroup.entity';
import { Permission } from './Permission.entity';

@Entity('user_group_permissions')
export class UserGroupPermission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => UserGroup, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_group_id' })
    userGroup: UserGroup;

    @Column()
    user_group_id: string;

    @ManyToOne(() => Permission, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'permission_id' })
    permission: Permission;

    @Column()
    permission_id: string;
}
