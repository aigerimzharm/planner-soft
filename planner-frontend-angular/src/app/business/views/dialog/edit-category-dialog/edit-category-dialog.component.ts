import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {TranslateService} from '@ngx-translate/core';
import {DialogAction, DialogResult} from '../DialogResult';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';
import {Category} from '../../../data/model/Model';


@Component({
    selector: 'app-edit-category-dialog',
    templateUrl: './edit-category-dialog.component.html',
    styleUrls: ['./edit-category-dialog.component.css']
})

// создание/редактирование категории
export class EditCategoryDialogComponent implements OnInit {

    constructor(
        private dialogRef: MatDialogRef<EditCategoryDialogComponent>, // для работы с текущим диалог. окном
        @Inject(MAT_DIALOG_DATA) private data: [Category, string], // данные, которые передали в диалоговое окно
        private dialogBuilder: MatDialog, // для открытия нового диалогового окна (из текущего) - например для подтверждения удаления
        private translate: TranslateService // локализация
    ) {
    }

    dialogTitle: string; // текст для диалогового окна
    category: Category; // переданный объект для редактирования
    canDelete = false; // можно ли удалять объект (активна ли кнопка удаления)

    ngOnInit(): void {

        // получаем переданные данные из компонента
        this.category = this.data[0];
        this.dialogTitle = this.data[1];

        // если было передано значение, значит это редактирование, поэтому делаем удаление возможным (иначе скрываем иконку)
        if (this.category && this.category.id && this.category.id > 0) {
            this.canDelete = true;
        }
    }


  // нажали ОК
  confirm(): void {

    // если не ввели название - выходим из метода и не даем сохранить
    // (пользователь будет обязан ввести какое-либо значение или просто закрыть окно)
    if (!this.category.title || this.category.title.trim().length === 0){
      return;
    }

    // нажали ОК и передаем измененный объект category
    this.dialogRef.close(new DialogResult(DialogAction.SAVE, this.category));
  }

  // нажали отмену
  cancel(): void {
    this.dialogRef.close(new DialogResult(DialogAction.CANCEL));
  }



  // нажали Удалить
  delete(): void {

    const dialogRef = this.dialogBuilder.open(ConfirmDialogComponent, {
      maxWidth: '500px',
      data: {
        dialogTitle: this.translate.instant('COMMON.CONFIRM'),
        message: this.translate.instant('CATEGORY.CONFIRM-DELETE', {name: this.category.title})
      },
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {

      if (!(result)) { // если просто закрыли окно, ничего не нажав
        return;
      }


      if (result.action === DialogAction.OK) {
        this.dialogRef.close(new DialogResult(DialogAction.DELETE)); // подтвердил удаление
      }
    });


  }


}
