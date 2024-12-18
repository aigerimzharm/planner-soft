// данные для отображения дашбоарда со статистикой вверху страницы
export class DashboardData {

    // этих двух переменных хватает для всей общей статистики
    completedTotal: number;
    uncompletedTotal: number;

    constructor(completedTotal?: number, uncompletedTotal?: number) {
        this.completedTotal = completedTotal;
        this.uncompletedTotal = uncompletedTotal;
    }
}
