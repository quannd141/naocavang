import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateMeDto {
  @ApiProperty({ example: 'Quân Nguyễn', minLength: 1, maxLength: 100 })
  @IsString()
  @MinLength(1, { message: 'Tên không được để trống' })
  @MaxLength(100)
  name!: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(72)
  oldPassword!: string;

  @ApiProperty({ minLength: 8, maxLength: 72 })
  @IsString()
  @MinLength(8, { message: 'Mật khẩu mới phải ≥ 8 ký tự' })
  @MaxLength(72)
  newPassword!: string;
}
