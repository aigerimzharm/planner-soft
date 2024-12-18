import {CommonDAO} from './CommonDAO';
import {Observable} from 'rxjs';
import {CategorySearchValues} from '../../model/SearchObjects';
import {Category} from '../../model/Model';

// специфичные методы для работы с категориями (которые не входят в обычный CRUD)
export interface CategoryDAO extends CommonDAO<Category> {

    // поиск категорий по любым параметрам, указанных в CategorySearchValues
    findCategories(categorySearchValues: CategorySearchValues): Observable<Category[]>;

}
