import {Observable} from 'rxjs';
import {Stat} from '../../model/Model';

// общая статистика по всем задачам
export interface StatDAO {

    getOverallStat(email: string): Observable<Stat>;

}
