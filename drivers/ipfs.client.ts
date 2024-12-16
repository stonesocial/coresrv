import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ObjectManager } from "@filebase/sdk";
import { requestWrapper } from '../utils/request.wrapper.js';
import { HttpClient } from './http.client.js';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class IpfsClient {
  private readonly objectManager: ObjectManager;
  private readonly httpClientService: HttpClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.httpClientService = new HttpClient(
      this.configService.get<string>('FILEBASE_IPFS_GATEWAY_URL'), 
      this.httpService,
    );
    this.objectManager = new ObjectManager(
      this.configService.get<string>('FILEBASE_API_KEY'),
      this.configService.get<string>('FILEBASE_API_SECRET'),
      { bucket: this.configService.get<string>('FILEBASE_BUCKET') }
    );
  }
  
  async get(key: string, bucket?: string): Promise<any> {
    return await requestWrapper(
      async () => await this.httpClientService.get(
        `ipfs/${(await this.objectManager.get(key, { bucket })).Metadata.cid}`,
      ),
    );
  }
  
  async add(key: string, data: any, metadata?: object, options?: object) : Promise<string> {
    return await requestWrapper(
      async () => (await this.objectManager.upload(key, data, metadata, options)).cid,
    );
  }
}