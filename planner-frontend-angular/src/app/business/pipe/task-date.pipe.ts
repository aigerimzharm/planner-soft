import {Pipe, PipeTransform} from '@angular/core';
import {DatePipe} from '@angular/common';
import {TranslateService} from '@ngx-translate/core';

// преобразовывает дату в нужный текстовый формат

// документация https://angular.io/guide/pipes

@Pipe({
    name: 'taskDate'
})
export class TaskDatePipe implements PipeTransform {

    constructor(private translate: TranslateService) {}


    transform(date: Date | string, format: string = 'mediumDate'): string { // mediumDate - форматирование по-умолчанию

        if (!date) {
            return this.translate.instant('TASKS.WITHOUT-DATE');
        }

        date = new Date(date); // из string делаем Date, чтобы далее уже работать с объектом Date

        const currentDate = new Date().getDate();


        // замена даты на текст

        if (date.getDate() === currentDate) {
            return this.translate.instant('TASKS.TODAY');
        }

        if (date.getDate() === currentDate - 1) {
            return this.translate.instant('TASKS.YESTERDAY');
        }

        if (date.getDate() === currentDate + 1) {
            return this.translate.instant('TASKS.TOMORROW');

        }

        return new DatePipe(this.translate.currentLang).transform(date, format); // показывать дату в нужной локали (на нужном языке)
    }

}
