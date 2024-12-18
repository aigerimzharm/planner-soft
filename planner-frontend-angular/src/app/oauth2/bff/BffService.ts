import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';


// напоминание: все запросы отправляются не напрямую в ResourceServer, а в BFF (backend for frontend), который является адаптеров
// это нужно для безопасного хранения куков в браузере


@Injectable({
  providedIn: 'root'
})

// не наследуется, т.к. не нужны другие методы
export class BffService {

  constructor(private http: HttpClient) {
  }


  // выход из системы
  logoutAction(): Observable<any> { //
    // просто вызываем адрес и ничего не возвращаем
    return this.http.get(environment.bffURI + '/logout_user');
  }


  // получаем новые токены с помощью старого Refresh Token (из кука)
  exchangeRefreshToken(): Observable<any> {
    return this.http.get(environment.bffURI + '/exchange');
  }
}
