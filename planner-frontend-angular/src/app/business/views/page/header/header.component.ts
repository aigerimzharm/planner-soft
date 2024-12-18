import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DeviceDetectorService} from 'ngx-device-detector';
import {MatDialog} from '@angular/material/dialog';
import {SettingsDialogComponent} from '../../dialog/settings-dialog/settings-dialog.component';
import {DialogAction} from '../../dialog/DialogResult';
import {Priority} from '../../../data/model/Model';
import {User} from '../../../../oauth2/model/User';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

// "presentational component": отображает полученные данные и отправляет какие-либо действия обработчику
// назначение - работа с меню и другими данными вверху страницы
// класс не видит dataHandler, т.к. напрямую с ним не должен работать


// примеры выпадающих меню https://material.angular.io/components/menu/examples


export class HeaderComponent implements OnInit {

  // ----------------------- входящие параметры ----------------------------

  @Input()
  categoryName: string; // текущая выбранная категория для отображения

  @Input()
  user: User; // пользователь для отображения его имени

  @Input()
  showStat: boolean;

  @Input()
  showMobileSearch: boolean;


  // ----------------------- исходящие действия----------------------------

  @Output()
  toggleMenuEvent = new EventEmitter(); // показать/скрыть меню

  @Output()
  toggleStatEvent = new EventEmitter<boolean>(); // показать/скрыть статистику

  @Output()
  settingsChangedEvent = new EventEmitter<Priority[]>();

  @Output()
  toggleMobileSearchEvent = new EventEmitter<boolean>(); // показать/скрыть поиск (для моб. устройств)

  @Output()
  logoutEvent = new EventEmitter(); // выход из системы

  // -------------------------------------------------------------------------


  isMobile: boolean; // зашли на сайт с мобильного устройства или нет?


  constructor(
    private dialogBuilder: MatDialog, // для отображения диалоговых окон
    private deviceService: DeviceDetectorService // для определения устройства пользователя

  ) {
    this.isMobile = deviceService.isMobile();
  }

  ngOnInit(): void {
  }


  // скрыть/показать левое меню с категорими
  onToggleMenu(): void {
    this.toggleMenuEvent.emit(); // показать/скрыть меню
  }

  // скрыть/показать статистику
  onToggleStat(): void {
    this.toggleStatEvent.emit(!this.showStat); // вкл/выкл статистику
  }


  logoutAction(): void {
    this.logoutEvent.emit();
  }


  // окно настроек
  showSettings(): void {
    const dialogRef = this.dialogBuilder.open(SettingsDialogComponent,
      {
        autoFocus: false,
        width: '600px',
        minHeight: '300px',
        data: [this.user],
        maxHeight: '90vh' // будет занимать 90% экрана по высоте

      },
    );

    dialogRef.afterClosed().subscribe(result => {

      if (result && result.action === DialogAction.SETTINGS_CHANGE) {
        this.settingsChangedEvent.emit(result.obj);
        return;
      }
    });
  }


  // показать/скрыть инструменты поиска
  onToggleMobileSearch(): void {
    this.toggleMobileSearchEvent.emit(!this.showMobileSearch);
  }


}
