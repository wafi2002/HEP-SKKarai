import { Controller, Get, Post, Patch, Delete, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { FunctionService } from './function.service';
import { CreateFunctionDto } from './dto/create-function.dto';
import { UpdateFunctionDto } from './dto/update-function.dto';

@Controller('function')
export class FunctionController {
    constructor(private readonly functionService: FunctionService) {}

    @Get()
    findAll() {
        return this.functionService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.functionService.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateFunctionDto) {
        return this.functionService.create(dto);
    }

    @Post(':id/permission')
    addPermission(@Param('id') id: string, @Body() body: { name: string }) {
        return this.functionService.addPermission(id, body.name);
    }

    @Delete(':functionId/permission/:permissionId')
    @HttpCode(HttpStatus.NO_CONTENT)
    removePermission(
        @Param('functionId') functionId: string,
        @Param('permissionId') permissionId: string,
    ) {
        return this.functionService.removePermission(functionId, permissionId);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateFunctionDto) {
        return this.functionService.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: string) {
        return this.functionService.remove(id);
    }
}
