import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserGroup } from '../../entities/UserGroup.entity';
import { Permission } from '../../entities/Permission.entity';
import { UserGroupPermission } from '../../entities/UserGroupPermission.entity';
import { SystemFunction } from '../../entities/SystemFunction.entity';
import { CreateUserGroupDto } from './dto/create-user-group.dto';
import { UpdateUserGroupDto } from './dto/update-user-group.dto';

@Injectable()
export class UserGroupService {
    constructor(
        @InjectRepository(UserGroup)
        private userGroupRepository: Repository<UserGroup>,
        @InjectRepository(SystemFunction)
        private functionRepository: Repository<SystemFunction>,
        @InjectRepository(Permission)
        private permissionRepository: Repository<Permission>,
        @InjectRepository(UserGroupPermission)
        private ugPermissionRepository: Repository<UserGroupPermission>,
    ) {}

    async findAll(): Promise<UserGroup[]> {
        return this.userGroupRepository.find({ order: { name: 'ASC' } });
    }

    async findOne(id: string): Promise<UserGroup> {
        const userGroup = await this.userGroupRepository.findOne({ where: { id } });
        if (!userGroup) throw new NotFoundException(`User group tidak dijumpai`);
        return userGroup;
    }

    async create(dto: CreateUserGroupDto): Promise<UserGroup> {
        const existing = await this.userGroupRepository.findOne({ where: { name: dto.name } });
        if (existing) throw new ConflictException('Nama user group sudah wujud');

        const userGroup = this.userGroupRepository.create(dto);
        return this.userGroupRepository.save(userGroup);
    }

    async update(id: string, dto: UpdateUserGroupDto): Promise<UserGroup> {
        const userGroup = await this.findOne(id);

        if (dto.name && dto.name !== userGroup.name) {
            const existing = await this.userGroupRepository.findOne({ where: { name: dto.name } });
            if (existing) throw new ConflictException('Nama user group sudah wujud');
        }

        Object.assign(userGroup, dto);
        return this.userGroupRepository.save(userGroup);
    }

    async remove(id: string): Promise<void> {
        const userGroup = await this.findOne(id);
        await this.userGroupRepository.remove(userGroup);
    }

    async getFunctionsWithPermissions(groupId: string) {
        await this.findOne(groupId);

        const functions = await this.functionRepository.find({ order: { name: 'ASC' } });
        const permissions = await this.permissionRepository.find();
        const activePerms = await this.ugPermissionRepository.find({
            where: { user_group_id: groupId },
        });

        const activePermIds = new Set(activePerms.map(p => p.permission_id));

        return functions.map(func => ({
            id: func.id,
            name: func.name,
            description: func.description,
            permissions: permissions
                .filter(p => p.function_id === func.id)
                .map(p => ({
                    id: p.id,
                    label: p.name,
                    active: activePermIds.has(p.id),
                })),
        }));
    }

    async savePermissions(groupId: string, permissionIds: string[]): Promise<void> {
        await this.findOne(groupId);

        // Delete existing permissions for this group
        await this.ugPermissionRepository.delete({ user_group_id: groupId });

        // Insert new active permissions
        if (permissionIds.length > 0) {
            const records = permissionIds.map(permission_id =>
                this.ugPermissionRepository.create({ user_group_id: groupId, permission_id })
            );
            await this.ugPermissionRepository.save(records);
        }
    }
}
