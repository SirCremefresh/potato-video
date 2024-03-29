import {BadRequestException, Body, Controller, Inject, NotFoundException, Post} from '@nestjs/common';
import {exec} from 'child_process';
import * as fs from 'fs';
import {WatchEntity} from '../entities/watch.entity';
import {generateId} from '../utils/generate-id.helper';
import {WatcherService} from '../watcher/watcher.service';

const crypto = require('crypto');

@Controller('watch')
export class WatchController {
  constructor(@Inject(WatcherService) private watcherService: WatcherService) {
  }

  @Post()
  public async createWatch(): Promise<{
    secretToken: string,
    watchId: string,
    watchToken: string
  }> {
    const secretToken = generateId();
    const watchToken = generateId().slice(0, 8);

    const watchEntity = new WatchEntity();
    watchEntity.secretTokenHash = this.hashString(secretToken);
    watchEntity.watchToken = watchToken;
    await watchEntity.save();

    let watchData = {
      secretToken: secretToken,
      watchId: watchEntity.watchId,
      watchToken: watchEntity.watchToken
    };
    console.log('Created new watch with data: ', watchData);
    this.watcherService.watchesInfo.set(watchEntity.watchId, []);
    return watchData;
  }

  @Post('video')
  public async addVideo(@Body() videoData: {
    secretToken: string,
    watchId: string,
    videoUrl: string
  }): Promise<{}> {
    const watch = await WatchEntity.findOne({
      watchId: videoData.watchId
    });

    if (!watch) {
      console.log(`could not find watch videoData: `, videoData);
      throw new NotFoundException('Could not find Watch');
    }

    if (watch.secretTokenHash !== this.hashString(videoData.secretToken)) {
      console.log(`Secret Tokens do not match: `, videoData);
      throw new NotFoundException('Secret Token did not match');
    }

    const videoId = generateId();

    try {
      console.log('Executing command');
      const result = await this.executeCommand(`cd /tmp/videos && youtube-dl -o ${videoId} --restrict-filenames --write-info-json "${videoData.videoUrl}"`);

      console.log('result of youtube-dl is: ', result);
    } catch (e) {
      return new BadRequestException('could not download video: ', e);
    }

    console.log('reading info file');
    let infoFile = JSON.parse(fs.readFileSync(`/tmp/videos/${videoId}.info.json`, {encoding: 'utf8'}));
    console.log('info file read');
    const videoInfo = {
      fulltitle: infoFile.fulltitle,
      thumbnail: infoFile.thumbnail,
      upload_date: infoFile.upload_date,
      duration: infoFile.duration,
      videoId: videoId
    };

    const newPlaylist = JSON.parse(watch.playlist);
    newPlaylist.push(videoInfo);
    watch.playlist = JSON.stringify(newPlaylist);
    console.log('new playlist is: ', watch.playlist, videoInfo);
    await watch.save();
    return videoInfo;
  }

  @Post('play')
  public async play(@Body() videoData: {
    secretToken: string,
    watchId: string,
  }) {
    const watch = await WatchEntity.findOne({
      watchId: videoData.watchId
    });

    if (!watch) {
      console.log(`could not find watch videoData: `, videoData);
      throw new NotFoundException('Could not find Watch');
    }

    if (watch.secretTokenHash !== this.hashString(videoData.secretToken)) {
      console.log(`Secret Tokens do not match: `, videoData);
      throw new NotFoundException('Secret Token did not match');
    }

    this.watcherService.play(watch.watchId);
    return {status: 'ok'};
  }

  @Post('info')
  public async getWatch(@Body() watchData: {
    secretToken: string,
    watchId: string,
  }): Promise<{}> {
    const watch = await WatchEntity.findOne({
      watchId: watchData.watchId
    });

    if (!watch) {
      console.log(`could not find watch videoData: `, watchData);
      throw new NotFoundException('Could not find Watch');
    }

    if (watch.secretTokenHash !== this.hashString(watchData.secretToken)) {
      console.log(`Secret Tokens do not match: `, watchData);
      throw new NotFoundException('Secret Token did not match');
    }

    let returnedWatchData = {
      watchId: watch.watchId,
      watchToken: watch.watchToken,
      playlist: JSON.parse(watch.playlist)
    };
    console.log('Getting Watch Info: ', returnedWatchData);
    return returnedWatchData;
  }

  private hashString(value: string): string {
    return crypto
      .createHash('sha256')
      .update(value)
      .digest('hex');
  }

  private executeCommand(command) {
    return new Promise((res, rej) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          rej(error.message);
        } else if (stderr) {
          rej(stderr);
        } else {
          res(stdout);
        }
      });
    });
  }
}
