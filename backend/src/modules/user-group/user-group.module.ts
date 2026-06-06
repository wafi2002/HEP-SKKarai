import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserGroup } from '../../entities/UserGroup.entity';
import { Permission } from '../../entities/Permission.entity';
import { UserGroupPermission } from '../../entities/UserGroupPermission.entity';
import { SystemFunction } from '../../entities/SystemFunction.entity';
import { UserGroupService } from './user-group.service';
import { UserGroupController } from './user-group.controller';

@Module({
    imports: [TypeOrmModule.forFeature([UserGroup, SystemFunction, Permission, UserGroupPermission])],
    providers: [UserGroupService],
    controllers: [UserGroupController],
    exports: [UserGroupService],
})
export class UserGroupModule {}
