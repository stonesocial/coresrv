import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createHelia } from 'helia';
import { createOrbitDB, Documents } from '@orbitdb/core';
import { gossipsub } from '@chainsafe/libp2p-gossipsub';
import { identify } from '@libp2p/identify';
import { createLibp2p, Libp2pOptions } from 'libp2p';
import { DbParam } from '../db.param.js';
import { requestWrapper } from '../utils/request.wrapper.js';

@Injectable()
export class OrbitDbDriver implements OnModuleInit, OnModuleDestroy {
  private ipfs: any;
  private orbitdb: any;
  private libp2p: any;
  public db: any;

  async onModuleInit() {
    const libp2pOptions: Libp2pOptions = {
      services: {
        pubsub: gossipsub({ allowPublishToZeroTopicPeers: true }),
        identify: identify(),
      },
    };
    this.libp2p = await createLibp2p(libp2pOptions);
    this.ipfs = await createHelia({ libp2p: this.libp2p });    
    this.orbitdb = await createOrbitDB({ ipfs: this.ipfs });
  }

  async onModuleDestroy() {
    await this.dispose();
  }

  async createDb(param: DbParam) {
    return await requestWrapper(async () => {
      this.db = await this.orbitdb.open(
        param.address, 
        { 
          sync: param.sync,
          type: param.type,
          Database: Documents({ indexBy: param.indexBy }) 
        }
      );
  
      return this.db;
    });
  }

  async openDb(address: string) {
    await requestWrapper(async () => {
      this.db = await this.orbitdb.open(address, { create: false });
    });
  }

  async getDbData(dbKey: string) : Promise<string> {
    return await requestWrapper(
      async () => {
        await this.openDb(dbKey);

        return JSON.stringify(await this.db.all());
      },
    );
  }

  async restoreDB(dbKey: string, snapshot: any) {
    return await requestWrapper(
      async () => {
        await this.openDb(dbKey);
        
        await snapshot.forEach((entry: any) => this.db.put(entry.value));

        return await this.db.all()
      }
    );
  }

  private async dispose() {
    if (this.db) await this.db.stop();
    if (this.orbitdb) await this.orbitdb.stop();
    if (this.ipfs) await this.ipfs.stop();
  }
}