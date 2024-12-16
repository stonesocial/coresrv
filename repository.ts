import { Injectable, NotFoundException } from '@nestjs/common';
import { OrbitDbDriver } from './drivers/orbitdb.driver.js';
import { requestWrapper } from './utils/request.wrapper.js';
import { ConfigService } from '@nestjs/config';
import { IpfsClient } from './drivers/ipfs.client.js';

@Injectable()
export abstract class Repository {
  protected constructor(
    public readonly orbitDbDriver: OrbitDbDriver,
    public readonly configService: ConfigService,
    public readonly ipfsClient: IpfsClient,
  ) {}

  async openDb(dbKey: string) {
    return await requestWrapper(
      async () => {
        const result = await this.ipfsClient.get(
          this.configService.get<string>(dbKey), 
          this.configService.get<string>('FILEBASE_BUCKET'), 
        );
        if (result && result.address) {
          await this.orbitDbDriver.openDb(result.address);
        } else {
          throw new NotFoundException('Error opening orbitdb');
        }
      }
    );
  }

  async put(data: any) {
    return await requestWrapper(
      async () => await this.orbitDbDriver.db.put(data),
    );
  }

  async all(compareFn?: (a: any, b: any) => number) : Promise<any[]> {
    return await requestWrapper(
      async () => {
        const results: any[] = await this.orbitDbDriver.db.all();
        if (compareFn) results.sort(compareFn);

        return results;
      }
    );
  }

  async get(key: string) {
    return await requestWrapper(
      async () => {
        const result =  await this.orbitDbDriver.db.get(key);
        if (!result) throw new NotFoundException(`Document ${key} was not found`);
    
        return result;
      }
    );
  }

  async query(findFn: (value: any) => boolean, compareFn?: (a: any, b: any) => number) {
    return await requestWrapper(
      async () => {
        const results = [];
        for await (const doc of this.orbitDbDriver.db.iterator()) {
          if (findFn(doc.value)) results.push(doc);
        }
        
        if (compareFn) results.sort(compareFn)

        return results;
      }
    );
  }

  async delete(key: string) {
    return await requestWrapper(
      async () => {
        if (await this.orbitDbDriver.db.get(key)) {
          return  await this.orbitDbDriver.db.del(key);
        }
        
        throw new NotFoundException(`Document ${key} was not found`)
      }
    );
  }
}