import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {tap} from 'rxjs/operators';
import {SpinnerService} from '../spinner/spinner.service';


// перехватывает все HTTP запросы для показа спиннера загрузки (пока не выполнится запрос)


@Injectable()
export class SpinnerInterceptor implements HttpInterceptor {

  constructor(private spinnerService: SpinnerService) {
  }

  // перехватываем все HTTP запросы
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    this.spinnerService.show(); // показать спиннер

    return next
      .handle(req)
      .pipe(
        tap((event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) { // пришел ответ - значит запрос завершен
            this.spinnerService.hide(); // когда запрос выполнился - убрать спиннер
          }
        }, (error) => {
          console.log(error);
          this.spinnerService.hide(); // если возникла ошибка - убрать спиннер
        })
      );
  }
}



