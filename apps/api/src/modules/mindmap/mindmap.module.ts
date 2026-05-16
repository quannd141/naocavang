import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MindMapService } from './application/mindmap.service';
import { MindMapController } from './presentation/mindmap.controller';

@Module({
  imports: [AuthModule],
  controllers: [MindMapController],
  providers: [MindMapService],
  exports: [MindMapService],
})
export class MindmapModule {}
