import { 
  HttpException, 
  HttpStatus, 
  Injectable, 
  InternalServerErrorException, 
  Logger
} from '@nestjs/common';
import { OrbitDbDriver } from '../drivers/orbitdb.driver.js';
import { DbParam } from '../db.param.js';
import { requestWrapper } from '../utils/request.wrapper.js';
import { IpfsService } from './ipfs.service.js';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OrbitDbService {
  private readonly logger = new Logger(OrbitDbService.name);
  
  constructor(
    private readonly orbitDbDriver: OrbitDbDriver,
    private readonly ipfsService: IpfsService,
    private readonly configService: ConfigService,
  ) {}
  
  async backupDb(dbKey: string) : Promise<Record<string, string>> {
    return await requestWrapper(
      async () => {
        const snapshot = await this.orbitDbDriver.getDbData(dbKey);
        
        if ((JSON.parse(snapshot) as []).length == 0) {
          throw new InternalServerErrorException('There is no data on db'); 
        } else {
          const { cid } = await this.ipfsService.add(`${dbKey}-snapshot`, snapshot);
          
          if (cid) return { cid, data: JSON.parse(snapshot) };

          throw new InternalServerErrorException(
            'There is unknown error perfoming data backup', 
          );
        }
      },
    );
  }

  async restoreDb(dbKey: string, data: any) : Promise<any> {
    return await requestWrapper(
      async () => await this.orbitDbDriver.restoreDB(dbKey, data),
    );
  }

  async backupAndRestoreDb(dbKey: string) : Promise<any> {
    return await requestWrapper(
      async () => {
        const result = await this.backupDb(dbKey);
        if (result) {
          await this.restoreDb(dbKey, result.data)

          return result;
        } 

        throw new InternalServerErrorException(
          'There is unknown error perfoming data backup', 
        );
      },
    );
  }

  @Cron('59 23 * * *')
  async backupAndSyncRotine() {
    this.logger.log('Init Users Backup...');
    await this.backupAndRestoreDb(this.configService.get<string>('USER_DB'));
    this.logger.log('Users backup executed!');

    this.logger.log('Init Posts Backup...');
    await this.backupAndRestoreDb(this.configService.get<string>('POST_DB'));
    this.logger.log('Posts backup executed!');
    
    this.logger.log('Init Notifications Backup...');
    await this.backupAndRestoreDb(this.configService.get<string>('NOTIFICATION_DB'));
    this.logger.log('Notifications backup executed!');
  }

  async createDb(param: DbParam) {
    return await requestWrapper(
      async () => {
        const db = await this.orbitDbDriver.createDb(param);
        if (!db) throw new HttpException('Error creating db on IPFS', HttpStatus.BAD_REQUEST);
        const { cid } = await this.ipfsService.add(param.address, JSON.stringify(db));
    
        return { cid, db };
      },
    );
  }
}