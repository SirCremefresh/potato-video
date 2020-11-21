import {Injectable} from '@nestjs/common';
import {Socket} from 'socket.io';
import {clearTimeout} from 'timers';
import {WatchEntity} from '../entities/watch.entity';
import Timeout = NodeJS.Timeout;

type Play = {
  fulltitle: string,
  thumbnail: string,
  upload_date: string,
  duration: number,
  videoId: string
}

@Injectable()
export class WatcherService {
  socketInfo: Map<Socket, { watcherId: string, watchId: string }> = new Map();
  watchesInfo: Map<string, Socket[]> = new Map();

  playing: Map<string, Timeout> = new Map();

  async play(watchId: string) {
    const watchInfo = await this.getWatch(watchId);

    if (watchInfo.playlist.length === 0) {
      console.log('Playlist is Empty ', watchId);
      return;
    }

    const isPlaying = this.playing.get(watchId);
    if (isPlaying) {
      clearTimeout(isPlaying);
    }

    this.startPlaylist(watchId);
  }

  private async startPlaylist(watchId: string) {
    const watchInfo = await this.getWatch(watchId);
    const currentPlay = watchInfo.playlist[0];
    this.playToWatchers(watchId, currentPlay);

    const timeoutId = setTimeout(async () => {
      const watchInfo = await this.getWatch(watchId);
      if (watchInfo.playlist.length === 0) {
        console.log('Playlist is Empty ', watchId);
        return;
      }
      watchInfo.playlist.shift();
      await this.savePlaylist(watchId, watchInfo.playlist);
      if (watchInfo.playlist.length === 0) {
        console.log('Playlist Finished ', watchId);
        return;
      }

      this.startPlaylist(watchId);
    }, (currentPlay.duration + 4) * 1000);

    this.playing.set(watchId, timeoutId);
  }

  private playToWatchers(watchId: string, play: Play) {
    const watchers = this.watchesInfo.get(watchId);
    if (watchers && watchers.length === 0) {
      console.log('no watchers or empty', watchId, watchers)
    }
    for (const socket of watchers) {
      socket.emit('watch_play', play);
    }
  }

  private async getWatch(watchId: string): Promise<{ watch: WatchEntity, playlist: Play[] }> {
    const watch = await WatchEntity.findOne({
      watchId: watchId
    }) as WatchEntity;
    const playlist = JSON.parse(watch.playlist) as Play[];
    return {playlist, watch};
  }

  private async savePlaylist(watchId: string, playlist: Play[]): Promise<void> {
    const watchInfo = await this.getWatch(watchId);
    watchInfo.watch.playlist = JSON.stringify(playlist);
    await watchInfo.watch.save();
  }
}
