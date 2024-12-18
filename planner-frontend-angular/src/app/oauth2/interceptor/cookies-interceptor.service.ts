import {Injectable} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import {delay, Observable} from 'rxjs';


// Добавляет в исходящие запросы настройку, которая позволяет браузеру добавлять куки в запрос.
// Иначе токены не будут отправляться в BFF
@Injectable()
export class CookiesInterceptor implements HttpInterceptor {

  constructor() {
  }

  // interceptor - это аналог фильтров в веб приложении
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    request = request.clone({
      setHeaders: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Origin': '*'
      },
      withCredentials: true, // обязательно нужно указывать, иначе браузер может не отправлять куки на сервер
    });

    return next.handle(request);
  }
}
