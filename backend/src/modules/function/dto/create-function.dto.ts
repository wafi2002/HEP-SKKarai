import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFunctionDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;
}
