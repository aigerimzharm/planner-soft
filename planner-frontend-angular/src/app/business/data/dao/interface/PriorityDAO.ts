import {CommonDAO} from './CommonDAO';
import {PrioritySearchValues} from '../../model/SearchObjects';
import {Observable} from 'rxjs';
import {Priority} from '../../model/Model';


// специфичные методы для работы приоритетами (которые не входят в обычный CRUD)
export interface PriorityDAO extends CommonDAO<Priority> {

    // поиск категорий по любым параметрам, указанных в PrioritySearchValues
    findPriorities(prioritySearchValues: PrioritySearchValues): Observable<Priority[]>;

}
