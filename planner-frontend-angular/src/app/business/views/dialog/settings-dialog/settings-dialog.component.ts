import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DialogAction, DialogResult} from '../DialogResult';
import {LANG_EN, LANG_RU} from '../../page/main/main.component';
import {PriorityService} from '../../../data/dao/impl/PriorityService';
import {TranslateService} from '@ngx-translate/core';
import {Priority} from '../../../data/model/Model';
import {User} from '../../../../oauth2/model/User';


@Component({
    selector: 'app-settings-dialog',
    templateUrl: './settings-dialog.component.html',
    styleUrls: ['./settings-dialog.component.css']
})

// диалоговое окно настроек приложения
// т.к. настройки не привязаны к другим компонентам (окнам),
// то он самостоятельно может загружать нужные данные с помощью dataHandler (а не получать их с помощью @Input)

export class SettingsDialogComponent implements OnInit {

    priorities: Priority[]; // список приоритетов для редактирования/удаления
    settingsChanged = false; // были ли изменены настройки
    lang: string; // хранит выбранный язык в настройках
    user: User;
    isLoading: boolean;

    // просто ссылаются на готовые константы
    en = LANG_EN;
    ru = LANG_RU;


    constructor(
        private dialogRef: MatDialogRef<SettingsDialogComponent>, // для возможности работы с текущим диалог. окном
        @Inject(MAT_DIALOG_DATA) private data: [User], // данные, которые передаем в текущее диалоговое окно
        private priorityService: PriorityService, // ссылка на сервис для работы с данными
        private translate: TranslateService, // для локализации
    ) {

        this.lang = translate.currentLang;
    }

    ngOnInit(): void {
        this.user = this.data[0]; // получаем текущего пользователя

        // получаем все приоритеты, чтобы отобразить настройку цветов
        this.loadPriorities();
    }

    private loadPriorities(): void {
        this.isLoading = true;
        this.priorityService.findAll(this.user.email).subscribe(priorities => {
            this.priorities = priorities;
            this.isLoading = false;
        });
    }

    // нажали Закрыть
    close(): void {

        if (this.settingsChanged) { // если в настройках произошли изменения
            this.dialogRef.close(new DialogResult(DialogAction.SETTINGS_CHANGE, this.priorities));
        } else {
            this.dialogRef.close(new DialogResult(DialogAction.CANCEL));
        }
    }


    // добавили приоритет
    addPriority(priority: Priority): void {

        priority.user = this.user;

        this.settingsChanged = true; // в настройках произошли изменения

        // сначала обновить в БД
        this.priorityService.add(priority).subscribe(result => {
            // т.к. данные простые и без сортировки - то можно просто добавить объект в локальный массив,
            // а не запрашивать заново из БД
            this.priorities.push(result);
        });
    }

    // удалили приоритет
    deletePriority(priority: Priority): void {

        this.settingsChanged = true; // в настройках произошли изменения

        // сначала обновить в БД
        this.priorityService.delete(priority.id).subscribe(() => {

                // т.к. данные простые и без сортировки - то можно просто удалить объект в локальном массиве,
                // а не запрашивать заново из БД
                this.priorities.splice(this.getPriorityIndex(priority), 1);
            }
        );
    }

    // обновили приоритет
    updatePriority(priority: Priority): void { // priority - измененный объект, который нужно отправить на backend

        this.settingsChanged = true; // в настройках произошли изменения

        // сначала обновить в БД
        this.priorityService.update(priority).subscribe(() => {

                // т.к. данные простые и без сортировки - то можно просто обновить объект в локальном массиве,
                // а не запрашивать заново из БД
                this.priorities[this.getPriorityIndex(priority)] = priority;
            }
        );
    }

    // находит индекс элемента (по id) в локальном массиве
    getPriorityIndex(priority: Priority): number {
        const tmpPriority = this.priorities.find(t => t.id === priority.id);
        return this.priorities.indexOf(tmpPriority);
    }

    // переключение языка
    langChanged(): void {
        this.translate.use(this.lang); // сразу устанавливаем язык для приложения
        this.settingsChanged = true; // указываем, что настройки были изменены
    }
}
