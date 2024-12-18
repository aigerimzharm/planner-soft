import {Component, Inject, OnInit} from '@angular/core';

import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';
import {DeviceDetectorService} from 'ngx-device-detector';
import {DialogAction, DialogResult} from '../DialogResult';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {TranslateService} from '@ngx-translate/core';
import {Priority, Task} from 'src/app/business/data/model/Model';
import {Category} from '../../../data/model/Model';

@Component({
    selector: 'app-edit-task-dialog',
    templateUrl: './edit-task-dialog.component.html',
    styleUrls: ['./edit-task-dialog.component.css']
})

// редактирование/создание задачи
export class EditTaskDialogComponent implements OnInit {

    constructor(
        private dialogRef: MatDialogRef<EditTaskDialogComponent>, // для возможности работы с текущим диалог. окном
        @Inject(MAT_DIALOG_DATA) private data: [Task, string, Category[], Priority[]], // данные, которые передаем в текущее диалоговое окно
        private dialog: MatDialog, // для открытия нового диалогового окна (из текущего) - например для подтверждения удаления
        private deviceService: DeviceDetectorService, // определение устройства пользователя
        private translate: TranslateService // локализация
    ) {
    }

    // чтобы выбирать из выпад. списка -
  // коллекции получаем из главной страницы (через параметры диалог. окна), чтобы здесь заново не делать запрос в БД
    categories: Category[];
    priorities: Priority[];

    // зашли на сайт с мобильного устройства или нет?
    isMobile = this.deviceService.isMobile();

    dialogTitle: string; // заголовок окна
    task: Task; // задача для редактирования/создания

    // сохраняем все значения в отдельные переменные,
    // чтобы изменения не сказывались на самой задаче и можно было отменить изменения
    newTitle: string;
    newPriorityId: number;
    categoryId: number;
    newDate: Date;

    canDelete = false; // можно ли удалять объект (активна ли кнопка удаления)
    canComplete = false; // можно ли завершить задачу (зависит от текущего статуса)

    today = new Date(); // хранит сегодняшнюю дату


    ngOnInit(): void {
        this.task = this.data[0]; // задача для редактирования/создания
        this.dialogTitle = this.data[1]; // текст для диалогового окна
        this.categories = this.data[2]; // категории для выпадающего списка
        this.priorities = this.data[3]; // приоритеты для выпадающего списка

        // если было передано значение, значит это редактирование (не создание новой задачи),
        // поэтому делаем удаление возможным (иначе скрываем иконку)
        if (this.task && this.task.id > 0) {
            this.canDelete = true;
            this.canComplete = true;
        }

        // инициализация начальных значений (записывам в отдельные переменные
        // чтобы можно было отменить изменения, а то будут сразу записываться в задачу)

        this.newTitle = this.task.title;

        // чтобы в html странице корректно работали выпадающие списки - лучше работать не с объектами, а с их id
        if (this.task.priority) {
            this.newPriorityId = this.task.priority.id;
        }

        if (this.task.category) {
            this.categoryId = this.task.category.id;
        }

        if (this.task.taskDate) {

            // создаем new Date, чтобы переданная дата из задачи автоматически сконвертировалась в текущий timezone
            // (иначе будет показывать время UTC)
            this.newDate = new Date(this.task.taskDate);
        }


    }

    // нажали ОК
    confirm(): void {

        // если не ввели название - выходим из метода и не даем сохранить
      // (пользователь будет обязан ввести какое-либо значение или просто закрыть окно)
        if (!this.newTitle || this.newTitle.trim().length === 0){
            return;
        }

        // считываем все значения для сохранения в поля задачи
        this.task.title = this.newTitle;
        this.task.priority = this.findPriorityById(this.newPriorityId);
        this.task.category = this.findCategoryById(this.categoryId);

        if (!this.newDate) {
            this.task.taskDate = null;
        } else {
            // в поле дата хранится в текущей timezone, в БД дата автоматически сохранится в формате UTC
            this.task.taskDate = this.newDate;
        }


        // передаем добавленную/измененную задачу в обработчик
        // что с ним будут делать - уже на задача этого компонента
        this.dialogRef.close(new DialogResult(DialogAction.SAVE, this.task));

    }

    // нажали отмену (ничего не сохраняем и закрываем окно)
    cancel(): void {
        this.dialogRef.close(new DialogResult(DialogAction.CANCEL));
    }

    // нажали Удалить
    delete(): void {

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            maxWidth: '500px',
            data: {
                dialogTitle: this.translate.instant('COMMON.CONFIRM'),
                message: this.translate.instant('TASKS.CONFIRM-DELETE', {name: this.task.title})
            },
            autoFocus: false
        });

        dialogRef.afterClosed().subscribe(result => {

            if (!(result)) { // если просто закрыли окно, ничего не нажав
                return;
            }


            if (result.action === DialogAction.OK) {
                this.dialogRef.close(new DialogResult(DialogAction.DELETE)); // нажали удалить
            }
        });
    }

    // нажали Выполнить (завершить) задачу
    complete(): void {
        this.dialogRef.close(new DialogResult(DialogAction.COMPLETE));

    }

    // делаем статус задачи "незавершенным" (активируем)
    activate(): void {
        this.dialogRef.close(new DialogResult(DialogAction.ACTIVATE));
    }


    // поиск приоритета по id
    private findPriorityById(tmpPriorityId: number): Priority {
        return this.priorities.find(t => t.id === tmpPriorityId);
    }

    // поиск категории по id
    private findCategoryById(tmpCategoryId: number): Category {
        return this.categories.find(t => t.id === tmpCategoryId);
    }

    // установка даты + кол-во дней
    addDays(days: number): void {
        this.newDate = new Date();
        this.newDate.setDate(this.today.getDate() + days); // прибавляем нужное кол-во дней
    }

    // установка даты "сегодня"
    setToday(): void {
        this.newDate = this.today;
    }


}
