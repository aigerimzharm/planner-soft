
// спец. класс для перевода на языки - компонента MatPaginator (кнопки постраничности)
// пример https://dsebastien.medium.com/translating-the-matpaginator-angular-material-component-f72b52158dfc
import {Injectable} from '@angular/core';
import {MatPaginatorIntl} from '@angular/material/paginator';
import {TranslateService} from '@ngx-translate/core';

@Injectable()
export class TasksMatPaginatorIntl extends MatPaginatorIntl {

    constructor(
        private translate: TranslateService, // для локализации
    ) {
        super();
        super.itemsPerPageLabel = translate.instant('PAGING.PAGE-SIZE');
        super.previousPageLabel = translate.instant('PAGING.PREV');
        super.nextPageLabel = translate.instant('PAGING.NEXT');
        super.lastPageLabel = translate.instant('PAGING.LAST');
        super.firstPageLabel = translate.instant('PAGING.FIRST');

    }

    getRangeLabel = function(page, pageSize, length) {
        if (length === 0 || pageSize === 0) {
            return '0 ' + this.translate.instant('PAGING.OF') + ' ' + length;
        }
        length = Math.max(length, 0);
        const startIndex = page * pageSize;
        // If the start index exceeds the list length, do not try and fix the end index to the end.
        const endIndex = startIndex < length ?
            Math.min(startIndex + pageSize, length) :
            startIndex + pageSize;
        return startIndex + 1 + ' - ' + endIndex + ' ' + this.translate.instant('PAGING.OF') + ' ' + length;
    };

}
