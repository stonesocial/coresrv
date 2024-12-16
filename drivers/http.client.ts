import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { requestWrapper } from '../utils/request.wrapper.js';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class HttpClient {

  constructor(
    private readonly urlBase: string,
    private readonly httpService: HttpService,
  ) {}
  
  async get(path: string, headers?: object): Promise<any> {
    return await requestWrapper(
      async () => (await firstValueFrom(
        this.httpService.get(
          `${this.urlBase}/${path}`, 
          { headers: headers ?? { "Content-Type": 'Application/Json' } },
        ),
      )).data,
    );
  }
}