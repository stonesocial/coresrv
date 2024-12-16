import { BadRequestException, Injectable } from '@nestjs/common';
import { IpfsClient } from '../drivers/ipfs.client.js';

@Injectable()
export class IpfsService {

  constructor(
    private readonly ipfsClient: IpfsClient,
  ) {}
  
  async get(key: string, bucket?: string): Promise<any> {
    return await this.ipfsClient.get(key, bucket);
  }
  
  async add(key: string, data: any, metadata?: object, options?: object) : Promise<any> {
    if (!data) throw new BadRequestException('No file uploaded.');
    
    const cid = await this.ipfsClient.add(key, data, metadata, options);

    return { cid, createdAt: new Date().toISOString() }
  }
}