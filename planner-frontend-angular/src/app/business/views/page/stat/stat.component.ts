import {Component, Input, OnInit} from '@angular/core';
import {DashboardData} from '../../../object/DashboardData';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
    selector: 'app-stat',
    templateUrl: './stat.component.html',
    styleUrls: ['./stat.component.css'],
    animations: [

        trigger('statRegion', [
            state('show', style({
                overflow: 'hidden',
                height: '*',
                opacity: '10',
            })),
            state('hide', style({
                opacity: '0',
                overflow: 'hidden',
                height: '0px',
            })),


            transition('* => *', animate('300ms ease-in-out'))

        ])


    ]
})

// "presentational component": отображает полученные данные и отправляет какие-либо действия обработчику
// назначение - показать статистику
export class StatComponent implements OnInit {


    // ----------------------- входящие параметры ----------------------------


    @Input()
    dash: DashboardData; // данные дэшбоарда

    @Input('showStat')
    set setShowStat(show: boolean) { // показать или скрыть статистику

        this.showStatistics = show;
        this.initStatDash(); // каждый раз при изменении значения - показывать анимацию скрытия/показа

    }


    // -------------------------------------------------------------------------


    showStatistics: boolean;
    animationState: string; // для анимации скрытия/показа


    constructor() {

    }

    ngOnInit(): void {
    }

    getTotal(): number {
        if (this.dash) {
            return this.dash.completedTotal + this.dash.uncompletedTotal; // суммируем завершенные и незавершенные задачи
        }
    }

    getCompletedCount(): number {
        if (this.dash) {
            return this.dash.completedTotal;
        }
    }

    getUncompletedCount(): number {
        if (this.dash) {
            return this.dash.uncompletedTotal;
        }
    }

    getCompletedPercent(): number {
        if (this.dash) {
            return this.dash.completedTotal ? (this.dash.completedTotal / this.getTotal()) : 0;
        }
    }

    getUncompletedPercent(): number {
        if (this.dash) {
            return this.dash.uncompletedTotal ? (this.dash.uncompletedTotal / this.getTotal()) : 0;
        }
    }

    initStatDash(): void {
        if (this.showStatistics) {
            this.animationState = 'show';
        } else {
            this.animationState = 'hide';
        }
    }
}
