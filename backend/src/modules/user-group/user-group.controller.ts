import { Controller, Get, Post, Patch, Delete, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { UserGroupService } from './user-group.service';
import { CreateUserGroupDto } from './dto/create-user-group.dto';
import { UpdateUserGroupDto } from './dto/update-user-group.dto';

@Controller('user-group')
export class UserGroupController {
    constructor(private readonly userGroupService: UserGroupService) {}

    @Get()
    findAll() {
        return this.userGroupService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.userGroupService.findOne(id);
    }

    @Get(':id/functions')
    getFunctionsWithPermissions(@Param('id') id: string) {
        return this.userGroupService.getFunctionsWithPermissions(id);
    }

    @Post()
    create(@Body() dto: CreateUserGroupDto) {
        return this.userGroupService.create(dto);
    }

    @Post(':id/permissions')
    @HttpCode(HttpStatus.NO_CONTENT)
    savePermissions(@Param('id') id: string, @Body() body: { permissionIds: string[] }) {
        return this.userGroupService.savePermissions(id, body.permissionIds);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateUserGroupDto) {
        return this.userGroupService.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: string) {
        return this.userGroupService.remove(id);
    }
}
