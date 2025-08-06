import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()     
  @IsString()        
  avatar?: string;
}

export class LoginDto {
  @IsString()
  identifier: string; 

  @IsString()
  password: string;
}
