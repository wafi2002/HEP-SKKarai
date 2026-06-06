import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemFunction } from '../../entities/SystemFunction.entity';
import { Permission } from '../../entities/Permission.entity';
import { CreateFunctionDto } from './dto/create-function.dto';
import { UpdateFunctionDto } from './dto/update-function.dto';

const DEFAULT_PERMISSIONS = ['View', 'Create', 'Edit', 'Delete'];

@Injectable()
export class FunctionService {
    constructor(
        @InjectRepository(SystemFunction)
        private functionRepository: Repository<SystemFunction>,
        @InjectRepository(Permission)
        private permissionRepository: Repository<Permission>,
    ) {}

    async findAll(): Promise<SystemFunction[]> {
        return this.functionRepository.find({ order: { name: 'ASC' } });
    }

    async findOne(id: string): Promise<SystemFunction> {
        const func = await this.functionRepository.findOne({ where: { id } });
        if (!func) throw new NotFoundException('Function tidak dijumpai');
        return func;
    }

    async create(dto: CreateFunctionDto): Promise<SystemFunction> {
        const existing = await this.functionRepository.findOne({ where: { name: dto.name } });
        if (existing) throw new ConflictException('Nama function sudah wujud');

        const func = this.functionRepository.create(dto);
        const saved = await this.functionRepository.save(func);

        // Auto-create 4 default permissions for this function
        const permissions = DEFAULT_PERMISSIONS.map(name =>
            this.permissionRepository.create({ name, function_id: saved.id })
        );
        await this.permissionRepository.save(permissions);

        return saved;
    }

    async update(id: string, dto: UpdateFunctionDto): Promise<SystemFunction> {
        const func = await this.findOne(id);

        if (dto.name && dto.name !== func.name) {
            const existing = await this.functionRepository.findOne({ where: { name: dto.name } });
            if (existing) throw new ConflictException('Nama function sudah wujud');
        }

        Object.assign(func, dto);
        return this.functionRepository.save(func);
    }

    async remove(id: string): Promise<void> {
        const func = await this.findOne(id);
        await this.functionRepository.remove(func);
    }

    async addPermission(functionId: string, name: string): Promise<Permission> {
        await this.findOne(functionId);

        const existing = await this.permissionRepository.findOne({
            where: { name, function_id: functionId },
        });
        if (existing) throw new ConflictException('Nama permission sudah wujud dalam function ini');

        const permission = this.permissionRepository.create({ name, function_id: functionId });
        return this.permissionRepository.save(permission);
    }

    async removePermission(functionId: string, permissionId: string): Promise<void> {
        await this.findOne(functionId);
        const permission = await this.permissionRepository.findOne({
            where: { id: permissionId, function_id: functionId },
        });
        if (!permission) throw new NotFoundException('Permission tidak dijumpai');
        await this.permissionRepository.remove(permission);
    }
}
