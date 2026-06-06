import { IsOptional, IsString } from 'class-validator';

export class UpdateFunctionDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;
}
