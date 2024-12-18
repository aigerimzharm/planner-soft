import {Observable} from 'rxjs';
import {Inject, Injectable, InjectionToken} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {StatDAO} from '../interface/StatDAO';
import {Stat} from '../../model/Model';
import {HttpMethod, Operation} from "../../../../oauth2/model/RequestBFF";
import {environment} from "../../../../../environments/environment";


// глобальная переменная для хранения URL
export const STAT_URL_TOKEN = new InjectionToken<string>('url');

@Injectable({
    providedIn: 'root'
})

// класс не реализовывает и не наследует, т.к. у него только 1 метод
export class StatService implements StatDAO {

    constructor(@Inject(STAT_URL_TOKEN) private baseUrl, // уникальный url для запросов
                private http: HttpClient // для выполнения HTTP запросов
    ) {
    }


    // общая статистика
    getOverallStat(email: string): Observable<Stat> {
      const operation = new Operation();
      operation.url = this.baseUrl;
      operation.body = email;
      operation.httpMethod = HttpMethod.POST;
      return this.http.post<Stat>(environment.bffURI + '/operation', operation);
        // return this.http.post<Stat>(this.baseUrl, email);
    }


}
