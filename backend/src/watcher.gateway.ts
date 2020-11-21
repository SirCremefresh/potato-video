import {Inject, NotFoundException} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import {Server, Socket} from 'socket.io';
import {WatcherEntity} from './entities/watcher.entity';
import {hashString} from './utils/hash.helper';
import {WatcherService} from './watcher/watcher.service';

@WebSocketGateway()
export class WatcherGateway implements OnGatewayInit, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(@Inject(WatcherService) private watcherService: WatcherService) {
  }

  afterInit(server: Server) {
    console.log('Websocket started!');
  }

  @SubscribeMessage('login')
  async handleMessage(@MessageBody() data: {
                        secretToken: string,
                        watcherId: string
                      },
                      @ConnectedSocket() client: Socket
  ) {
    const watcher = await WatcherEntity.findOne({
      watcherId: data.watcherId
    });

    if (!watcher) {
      console.log(`could not find watcher data: `, data);
      throw new NotFoundException('Could not find Watcher');
    }

    if (watcher.secretTokenHash !== hashString(data.secretToken)) {
      console.log(`Secret Tokens do not match: `, data);
      throw new NotFoundException('Secret Token did not match');
    }

    this.watcherService.socketInfo.set(client, {watchId: watcher.watchId, watcherId: watcher.watcherId});
    let watcherSockets = this.watcherService.watchesInfo.get(watcher.watchId) || [];
    watcherSockets.push(client);
    this.watcherService.watchesInfo.set(watcher.watchId, watcherSockets);

    console.log('login ', data);
    return 'Hello world!';
  }

  handleDisconnect(client: Socket): any {
    console.log('socket disconected');
    const socketInfo = this.watcherService.socketInfo.get(client);
    if (!socketInfo)
      return;
    let watcherSockets = this.watcherService.watchesInfo.get(socketInfo.watchId);
    watcherSockets.filter(value => value !== client);
    this.watcherService.watchesInfo.set(socketInfo.watcherId, watcherSockets);
    this.watcherService.socketInfo.delete(client);
  }
}
