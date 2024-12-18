import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ConfirmDialogComponent} from '../../dialog/confirm-dialog/confirm-dialog.component';
import {EditPriorityDialogComponent} from '../../dialog/edit-priority-dialog/edit-priority-dialog.component';
import {DialogAction} from '../../dialog/DialogResult';
import {MatDialog} from '@angular/material/dialog';
import {DeviceDetectorService} from 'ngx-device-detector';
import {TranslateService} from '@ngx-translate/core';
import {Priority} from '../../../data/model/Model';
import {User} from '../../../../oauth2/model/User';


@Component({
    selector: 'app-priorities',
    templateUrl: './priorities.component.html',
    styleUrls: ['./priorities.component.css']
})
export class PrioritiesComponent implements OnInit {

    static defaultColor = '#fcfcfc';

    // ----------------------- входящие параметры ----------------------------


    @Input()
    priorities: [Priority];

    @Input()
    user: User;


    // ----------------------- исходящие действия----------------------------

    // удалили
    @Output()
    deletePriorityEvent = new EventEmitter<Priority>();

    // изменили
    @Output()
    updatePriorityEvent = new EventEmitter<Priority>();

    // добавили
    @Output()
    addPriorityEvent = new EventEmitter<Priority>();

    // -------------------------------------------------------------------------


    isMobile: boolean; // зашли на сайт с мобильного устройства или нет?


    constructor(private dialog: MatDialog, // для открытия нового диалогового окна (из текущего))
                private translate: TranslateService, // локализация
                private deviceService: DeviceDetectorService, // для определения типа устройства

    ) {

        this.isMobile = this.deviceService.isMobile();

    }


    ngOnInit(): void {
    }


    // диалоговое окно для добавления
    openAddDialog(): void {

        const dialogRef = this.dialog.open(EditPriorityDialogComponent,
            {
                data:
                // передаем новый пустой объект для заполнения
                    [new Priority(null, '', PrioritiesComponent.defaultColor, this.user),
                        this.translate.instant('PRIORITY.ADDING')], width: '400px'
            });

        dialogRef.afterClosed().subscribe(result => {

            if (!(result)) { // если просто закрыли окно, ничего не нажав
                return;
            }


            if (result.action === DialogAction.SAVE) {
                const newPriority = result.obj as Priority;
                this.addPriorityEvent.emit(newPriority);
            }
        });


    }

    // редактирование
    openEditDialog(priority: Priority): void {

        const dialogRef = this.dialog.open(EditPriorityDialogComponent, {
            // передаем копию объекта, чтобы все изменения не касались оригинала (чтобы их можно было отменить)
            data: [new Priority(priority.id, priority.title, priority.color, this.user), this.translate.instant('PRIORITY.EDITING')]
        });

        dialogRef.afterClosed().subscribe(result => {


            if (!(result)) { // если просто закрыли окно, ничего не нажав
                return;
            }

            if (result.action === DialogAction.DELETE) {
                this.deletePriorityEvent.emit(priority);
                return;
            }


            if (result.action === DialogAction.SAVE) {
                priority = result.obj as Priority; // получить отредактированный объект
                this.updatePriorityEvent.emit(priority);
                return;
            }
        });


    }

    // иконка удаления в общем списке
    openDeleteDialog(priority: Priority): void {

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            maxWidth: '500px',
            data: {
                dialogTitle: this.translate.instant('COMMON.CONFIRM'),
                message: this.translate.instant('PRIORITY.CONFIRM-DELETE', {name: priority.title})
            },
            autoFocus: false
        });

        dialogRef.afterClosed().subscribe(result => {

            if (!(result)) { // если просто закрыли окно, ничего не нажав
                return;
            }

            if (result.action === DialogAction.OK) {
                this.deletePriorityEvent.emit(priority);
            }
        });
    }
}
