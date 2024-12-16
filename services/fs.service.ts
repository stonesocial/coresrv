import * as fs from 'fs';
import { Injectable } from '@nestjs/common';
import { requestWrapper } from '../utils/request.wrapper.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

@Injectable()
export class FsService {
    private readonly filePath: string;
     
    constructor(path: string) { this.filePath = path; }
    
    async set(key: string, value: string) {
      await requestWrapper(() => {
        const currJson = this.get();
        this.get()[`${key}`] = value;
        fs.writeFileSync(this.filePath, JSON.stringify(currJson));
      });
    }

    get(key?: string) {      
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const dirPath = join(__dirname, this.filePath);
      const json = JSON.parse(fs.readFileSync(dirPath, 'utf8'));

      if (key) return json[key];

      return json;
    }
}