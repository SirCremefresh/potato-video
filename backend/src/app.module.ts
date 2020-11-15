import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {TypeOrmModule, TypeOrmModuleOptions} from '@nestjs/typeorm';
import * as path from 'path';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import configuration from './config/configuration';
import {LoginController} from './login/login.controller';

@Module({
  imports: [
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
  controllers: [AppController, LoginController],
  providers: [AppService],
})
export class AppModule {
}
