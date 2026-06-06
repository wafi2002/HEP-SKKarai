import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemFunction } from '../../entities/SystemFunction.entity';
import { Permission } from '../../entities/Permission.entity';
import { FunctionService } from './function.service';
import { FunctionController } from './function.controller';

@Module({
    imports: [TypeOrmModule.forFeature([SystemFunction, Permission])],
    providers: [FunctionService],
    controllers: [FunctionController],
    exports: [FunctionService],
})
export class FunctionModule {}
