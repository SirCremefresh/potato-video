import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {ServeStaticModule} from '@nestjs/serve-static';
import {TypeOrmModule, TypeOrmModuleOptions} from '@nestjs/typeorm';
import * as path from 'path';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import configuration from './config/configuration';
import {LoginController} from './login/login.controller';
import { WatchController } from './watch/watch.controller';
import { WatcherGateway } from './watcher.gateway';
import { WatcherService } from './watcher/watcher.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'public'),
    }),
    ConfigModule.forRoot({
      envFilePath: ['./dev.env'],
      ignoreEnvFile: false,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (
        configService: ConfigService,
      ): Promise<TypeOrmModuleOptions> => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.user'),
        password: configService.get('database.password'),
        database: configService.get('database.user'),
        entities: [path.join(__dirname, '**', '*.entity.{ts,js}')],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController, LoginController, WatchController],
  providers: [AppService, WatcherGateway, WatcherService],
})
export class AppModule {
}
