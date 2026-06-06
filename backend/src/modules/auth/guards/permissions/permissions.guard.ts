import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserGroupPermission } from '../../../../entities/UserGroupPermission.entity';
import { Permission } from '../../../../entities/Permission.entity';
import { SystemFunction } from '../../../../entities/SystemFunction.entity';
import { PERMISSIONS_KEY, RequiredPermission } from '../../decorator/permissions/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        @InjectRepository(UserGroupPermission)
        private ugPermissionRepository: Repository<UserGroupPermission>,
        @InjectRepository(Permission)
        private permissionRepository: Repository<Permission>,
        @InjectRepository(SystemFunction)
        private functionRepository: Repository<SystemFunction>,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const required = this.reflector.getAllAndOverride<RequiredPermission>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!required) return true;

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user?.user_group_id) {
            throw new ForbiddenException('Tiada user group ditetapkan');
        }

        const func = await this.functionRepository.findOne({ where: { name: required.function } });
        if (!func) throw new ForbiddenException('Function tidak dijumpai');

        const permission = await this.permissionRepository.findOne({
            where: { name: required.permission, function_id: func.id },
        });
        if (!permission) throw new ForbiddenException('Permission tidak dijumpai');

        const hasPermission = await this.ugPermissionRepository.findOne({
            where: { user_group_id: user.user_group_id, permission_id: permission.id },
        });

        if (!hasPermission) {
            throw new ForbiddenException(`Anda tidak mempunyai akses: ${required.function} - ${required.permission}`);
        }

        return true;
    }
}
