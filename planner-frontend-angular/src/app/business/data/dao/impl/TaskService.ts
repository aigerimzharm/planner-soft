  import {Observable} from 'rxjs';
import {Inject, Injectable, InjectionToken} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {CommonService} from './CommonService';
import {TaskDAO} from '../interface/TaskDAO';
import {TaskSearchValues} from '../../model/SearchObjects';
import {environment} from '../../../../../environments/environment';
import { Task } from '../../model/Model';
import {HttpMethod, Operation} from '../../../../oauth2/model/RequestBFF';


// глобальная переменная для хранения URL
export const TASK_URL_TOKEN = new InjectionToken<string>('url');

@Injectable({
  providedIn: 'root'
})

export class TaskService extends CommonService<Task> implements TaskDAO {

  constructor(@Inject(TASK_URL_TOKEN) private baseUrl, // уникальный url для запросов
              private http: HttpClient // для выполнения HTTP запросов
  ) {
    super(baseUrl, http);
  }


  // поиск задач по любым параметрам
  findTasks(searchObj: TaskSearchValues): Observable<any> { // из backend получаем тип Page, поэтому указываем any
    const operation = new Operation();
    operation.url = this.baseUrl + '/search'; // это адрес, который BFF будет вызывать у Resource Server, добавляя к запросу access token
    operation.body = searchObj;
    operation.httpMethod = HttpMethod.POST;
    return this.http.post(environment.bffURI + '/operation', operation);
  }


}
