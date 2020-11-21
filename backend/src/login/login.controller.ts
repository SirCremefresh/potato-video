import {Body, Controller, NotFoundException, Post} from '@nestjs/common';
import {WatchEntity} from '../entities/watch.entity';
import {WatcherEntity} from '../entities/watcher.entity';
import {generateId} from '../utils/generate-id.helper';

const crypto = require('crypto');

@Controller('login')
export class LoginController {
  @Post('watcher')
  public async register(
    @Body() loginData: { username: string, watchToken: string }
  ): Promise<{
    username: string,
    secretToken: string,
    watcherId: string,
    watchId: string
  }> {
    const secretToken = generateId();

    const watch = await WatchEntity.findOne({
      watchToken: loginData.watchToken
    });

    if (!watch) {
      console.log(`could not find watch loginData: `, loginData);
      throw new NotFoundException('Could not find Watch');
    }

    const watcherEntity = new WatcherEntity();
    watcherEntity.username = loginData.username;
    watcherEntity.watchToken = loginData.watchToken;
    watcherEntity.watchId = watch.watchId;
    watcherEntity.secretTokenHash = this.hashString(secretToken);
    await watcherEntity.save();

    console.log(`New Watcher: `, {...watcherEntity}, ' \nsecretToken: ', secretToken);

    return {
      username: watcherEntity.username,
      secretToken: secretToken,
      watcherId: watcherEntity.watcherId,
      watchId: watcherEntity.watchId
    };
  }

  private hashString(value: string): string {
    return crypto
      .createHash('sha256')
      .update(value)
      .digest('hex');
  }

}
