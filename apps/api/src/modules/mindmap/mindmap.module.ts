import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MindMapService } from './application/mindmap.service';
import { MindMapController } from './presentation/mindmap.controller';
import { PublicMindMapController } from './presentation/public-mindmap.controller';

@Module({
  imports: [AuthModule],
  controllers: [MindMapController, PublicMindMapController],
  providers: [MindMapService],
  exports: [MindMapService],
})
export class MindmapModule {}
