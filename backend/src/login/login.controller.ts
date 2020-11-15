import {Body, Controller, Post, Res} from '@nestjs/common';
import * as crypto from 'crypto';
import {Response} from 'express';
import {WatcherEntity} from '../entities/watcher.entity';
import {generateId} from '../utils/generate-id.helper';

@Controller('login')
export class LoginController {
  @Post('watcher')
  public async register(
    @Body() loginData: { username: string },
    @Res() res: Response
  ): Promise<{ username: string, secretToken: string, watcherId: string }> {
    const secretToken = generateId();
    const watcherEntity = new WatcherEntity();
    watcherEntity.username = loginData.username;
    watcherEntity.secretTokenHash = this.hashString(secretToken);
    await watcherEntity.save();

    return {
      username: watcherEntity.username,
      secretToken: secretToken,
      watcherId: watcherEntity.watcherId
    };
  }

  private hashString(value: string): string {
    return crypto
      .createHash('sha256')
      .update(value)
      .digest('hex');
  }

}
