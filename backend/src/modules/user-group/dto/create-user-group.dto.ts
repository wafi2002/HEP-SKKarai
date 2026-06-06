import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserGroupDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;
}
