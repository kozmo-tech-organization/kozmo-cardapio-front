import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
export declare const getDatabaseConfig: (config: ConfigService) => TypeOrmModuleOptions;
