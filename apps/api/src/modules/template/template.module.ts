import { Module } from '@nestjs/common';
import { TemplateController } from './presentation/template.controller';

@Module({
  controllers: [TemplateController],
})
export class TemplateModule {}
