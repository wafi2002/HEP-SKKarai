import { Injectable } from '@nestjs/common';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Class } from 'src/entities/Class.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
  ){}

  create(createClassDto: CreateClassDto) {
    return 'This action adds a new class';
  }

  async findAll() {

    // build query
    return await this.classRepository.createQueryBuilder('class')
    .select([
      'class.id',
      'class.class_name',
      'class.academic_year_level',
      'class.class_teacher_name'
    ])
    .getMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} class`;
  }

  update(id: number, updateClassDto: UpdateClassDto) {
    return `This action updates a #${id} class`;
  }

  remove(id: number) {
    return `This action removes a #${id} class`;
  }
}
