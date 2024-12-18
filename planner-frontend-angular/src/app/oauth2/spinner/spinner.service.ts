import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

// сервис для отображения спиннера загрузки
// работает как переключатель вкл/выкл с помощью BehaviorSubject

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {

  visibility = new BehaviorSubject(false);

  show(): void {
    this.visibility.next(true);
  }

  hide(): void {
    this.visibility.next(false);
  }
}
