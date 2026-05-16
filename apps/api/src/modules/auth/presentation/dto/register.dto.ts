import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'minh@example.com' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @MaxLength(255)
  email!: string;

  @ApiProperty({
    example: 'SecurePass123',
    description: 'Mật khẩu tối thiểu 8 ký tự, có ít nhất 1 chữ và 1 số',
  })
  @IsString()
  @MinLength(8, { message: 'Mật khẩu tối thiểu 8 ký tự' })
  @MaxLength(72) // bcrypt limit
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'Mật khẩu phải có ít nhất 1 chữ và 1 số',
  })
  password!: string;

  @ApiProperty({ example: 'Nguyễn Văn Minh' })
  @IsString()
  @MinLength(2, { message: 'Tên tối thiểu 2 ký tự' })
  @MaxLength(100)
  name!: string;
}
