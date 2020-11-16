import {Body, Controller, Post} from '@nestjs/common';
import * as crypto from 'crypto';
import {WatcherEntity} from '../entities/watcher.entity';
import {generateId} from '../utils/generate-id.helper';

@Controller('login')
export class LoginController {
  @Post('watcher')
  public async register(
    @Body() loginData: { username: string }
  ): Promise<{ username: string, secretToken: string, watcherId: string }> {
    console.log(`New Watcher: ${loginData?.username}`);
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
