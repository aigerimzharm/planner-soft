import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DeviceDetectorService} from 'ngx-device-detector';
import {MatDialog} from '@angular/material/dialog';
import {MatTableDataSource} from '@angular/material/table';
import {TaskSearchValues} from '../../../data/model/SearchObjects';
import {TranslateService, TranslationChangeEvent} from '@ngx-translate/core';
import {ConfirmDialogComponent} from '../../dialog/confirm-dialog/confirm-dialog.component';
import {DialogAction} from '../../dialog/DialogResult';
import {EditTaskDialogComponent} from '../../dialog/edit-task-dialog/edit-task-dialog.component';
import {PageEvent} from '@angular/material/paginator';
import {AbstractControl, FormControl, FormGroup} from '@angular/forms';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {Category, Priority, Task} from 'src/app/business/data/model/Model';
import {User} from '../../../../oauth2/model/User';


@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css'],

  animations: [


    trigger('searchRegion', [
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
// назначение - работа со списком задач
export class TaskListComponent implements OnInit {


  // ----------------------- входящие параметры ----------------------------


  // переменные для настройки постраничности должны быть проинициализированы первыми (до обновления tasks)
  // чтобы компонент постраничности правильно отработал


  @Input()
  totalTasksFounded: number; // сколько всего задач найдено

  @Input()
  user: User; // текущий пользователь

  @Input()
  selectedCategory: Category; // выбранная категория


  // задачи для отображения на странице
  @Input('tasks')
  set setTasks(tasks: Task[]) {
    this.tasks = tasks;
    this.assignTableSource();   // передать данные таблице для отображения задач
  }

  // все возможные параметры для поиска задач
  @Input('taskSearchValues')
  set setTaskSearchValues(taskSearchValues: TaskSearchValues) {
    this.taskSearchValues = taskSearchValues;
    this.initSearchValues(); // записать в локальные переменные
    this.initSortDirectionIcon(); // показать правильную иконку в поиске задач (убывание, возрастание)
  }

  // приоритеты для фильтрации и выбора при редактировании/создании задачи (выпадающий список)
  @Input('priorities')
  //setPriorities(priorities: Priority[]): Priority[] { // в исходнике было так
  set setPriorities(priorities: Priority[]) {
    this.priorities = priorities;
  }

  // категории при редактировании/создании задачи (выпадающий список)
  @Input('categories')
  //setCategories(categories: Category[]): Category[] { // в исходнике было так
  set setCategories(categories: Category[]) {
    this.categories = categories;
  }


  @Input('showSearch')
  set setShowSearch(show: boolean) { // показать/скрыть инструменты поиска
    this.showSearch = show;
    this.initAnimation();  // каждый раз при изменении значения - показывать анимацию скрытия/показа
  }


  // ----------------------- исходящие действия----------------------------

  @Output()
  addTaskEvent = new EventEmitter<Task>();

  @Output()
  deleteTaskEvent = new EventEmitter<Task>();

  @Output()
  updateTaskEvent = new EventEmitter<Task>();

  @Output()
  pagingEvent = new EventEmitter<PageEvent>(); // переход по страницам данных

  @Output()
  toggleSearchEvent = new EventEmitter<boolean>(); // показать/скрыть поиск

  @Output()
  searchActionEvent = new EventEmitter<TaskSearchValues>(); // переход по страницам данных

  // -------------------------------------------------------------------------

  priorities: Priority[]; // список приоритетов (для фильтрации задач, для выпадающих списков)
  categories: Category[]; // список категорий
  tasks: Task[]; // текущий список задач для отображения

  // поля для таблицы (те, что отображают данные из задачи - должны совпадать с названиями переменных класса)
  displayedColumns: string[] = ['color', 'id', 'title', 'date', 'priority', 'category', 'operations'];
  dataSource: MatTableDataSource<Task> = new MatTableDataSource<Task>(); // источник данных для таблицы


  // значения для поиска (локальные переменные - для удобства)
  filterTitle: string;
  filterCompleted: number;
  filterPriorityId: number;
  filterSortColumn: string;
  filterSortDirection: string;
  dateRangeForm: FormGroup; // будет содержать даты для фильтрации/поиска задач


  isMobile: boolean; // зашли на сайт с мобильного устройства или нет?

  // параметры поиска задач - первоначально данные загружаются из cookies (в app.component)
  taskSearchValues: TaskSearchValues;

  // локализованный текст (когда нет значений)
  translateWithoutCategory: string;
  translateWithoutPriority: string;

  animationState: string; // для анимации скрытия/показа любой области
  showSearch = false; // показать/скрыть область поиска


  // цвета
  readonly colorCompletedTask = '#F8F9FA';
  readonly colorWhite = '#fff';

  // были ли изменения в фильтрах поиска
  filterChanged = false;

  // иконка сортировки (убывание, возрастание)
  sortIconName: string;
  // названия иконок из коллекции
  readonly iconNameDown = 'arrow_downward';
  readonly iconNameUp = 'arrow_upward';

  readonly defaultSortColumn = 'title';
  readonly defaultSortDirection = 'asc';


  constructor(
    private dialog: MatDialog, // работа с диалоговым окном
    private deviceService: DeviceDetectorService, // для определения типа устройства
    private translate: TranslateService, // локализация
  ) {
    this.isMobile = this.deviceService.isMobile();


  }


  ngOnInit(): void {
    // при изменении языка - обновить переводы, которые хранятся в переменных
    this.translate.onLangChange.subscribe((event: TranslationChangeEvent) => {
      this.initTranslations();
    });

    this.initDateRangeForm();

  }

  // ссылка на компоненты формы (для сокращения кода, чтобы каждый раз не писать this.datePickerRange.get('') )
  get dateFrom(): AbstractControl {
    return this.dateRangeForm.get('dateFrom');
  }

  // ссылка на компоненты формы (для сокращения кода, чтобы каждый раз не писать this.datePickerRange.get('') )
  get dateTo(): AbstractControl {
    return this.dateRangeForm.get('dateTo');
  }


  // обновить переводы, которые хранятся в переменных
  initTranslations(): void {
    this.translate.get(['TASKS.WITHOUT-CATEGORY', 'TASKS.WITHOUT-PRIORITY']).subscribe((res: string) => {
      this.translateWithoutCategory = res['TASKS.WITHOUT-CATEGORY']; // в нужном переводе
      this.translateWithoutPriority = res['TASKS.WITHOUT-PRIORITY'];
    });
  }

  // передать данные таблице для отображения задач
  assignTableSource(): void {

    // датасорс обязательно нужно создавать для таблицы, в него присваивается любой источник (БД, массивы, JSON и пр.)
    if (!this.dataSource) {
      return;
    }
    this.dataSource.data = this.tasks; // обновить источник данных (т.к. данные массива tasks обновились)

  }


  // в зависимости от статуса задачи - вернуть цвет
  getPriorityColor(task: Task): string {

    // если задача завершена - возвращаем цвет
    if (task.completed) {
      return this.colorCompletedTask;
    }

    // вернуть цвет приоритета, если он указан
    if (task.priority && task.priority.color) {
      return task.priority.color;
    }

    return this.colorWhite; // дефолтный цвет, если никакой не был найден

  }


  // нажали/отжали выполнение задачи
  onToggleCompleted(task: Task): void {

    // меняем значение на противоположное
    if (task.completed === 0) {
      task.completed = 1;
    } else {
      task.completed = 0;
    }

    this.updateTaskEvent.emit(task); // нужно обновить объект в БД

  }


  // диалоговое окно подтверждения удаления
  openDeleteDialog(task: Task): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '500px',
      data: {

        dialogTitle: this.translate.instant('COMMON.CONFIRM'),
        message: this.translate.instant('TASKS.CONFIRM-DELETE', {name: task.title})


      },
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {


      if (!(result)) { // если просто закрыли окно, ничего не нажав
        return;
      }


      if (result.action === DialogAction.OK) { // если нажали ОК
        this.deleteTaskEvent.emit(task);
      }
    });
  }


  // диалоговое редактирования задачи
  openEditDialog(task: Task): void {


    const dialogRef = this.dialog.open(EditTaskDialogComponent, {
      // task уже будет с какими-то данными, т.к. редактируем
      data: [task, this.translate.instant('TASKS.EDITING'), this.categories, this.priorities],
      // this.categories, this.priorities - для выбора в выпад. списке
      autoFocus: false,
      maxHeight: '90vh' // будет занимать 90% экрана по высоте
    });

    // подписываемся на результат работы диалогового окна
    dialogRef.afterClosed().subscribe(result => {


      if (!(result)) { // если просто закрыли окно, ничего не нажав
        return;
      }


      if (result.action === DialogAction.DELETE) {
        this.deleteTaskEvent.emit(task);
        return;
      }

      if (result.action === DialogAction.COMPLETE) {
        task.completed = 1; // ставим статус задачи как выполненная
        this.updateTaskEvent.emit(task);
      }


      if (result.action === DialogAction.ACTIVATE) {
        task.completed = 0; // возвращаем статус задачи как невыполненная
        this.updateTaskEvent.emit(task);
        return;
      }

      if (result.action === DialogAction.SAVE) { // если нажали ОК и есть результат
        this.updateTaskEvent.emit(task);
        return;
      }


    });
  }


  // диалоговое окно добавления задачи
  openAddDialog(): void {

    // создаем пустую задачу, чтобы передать ее в диалог. окно
    const task = new Task(null, '', 0, null, this.selectedCategory, this.user);

    const dialogRef = this.dialog.open(EditTaskDialogComponent, {

      // передаем новый пустой объект  для заполнения
      // также передаем справочные даныне (категории, приоритеты)
      data: [task, this.translate.instant('TASKS.ADDING'), this.categories, this.priorities],
      maxHeight: '95vh' // будет занимать 95% экрана по высоте

    });

    // подписываемся на результат работы диалогового окна
    dialogRef.afterClosed().subscribe(result => {

      if (!(result)) { // если просто закрыли окно, ничего не нажав
        return;
      }

      if (result.action === DialogAction.SAVE) { // если нажали ОК
        this.addTaskEvent.emit(task);
      }
    });

  }


  // в это событие попадает как переход на другую страницу (pageIndex), так и изменение кол-ва данных на страниц (pageSize)
  pageChanged(pageEvent: PageEvent): void {
    this.pagingEvent.emit(pageEvent);
  }


  // анимация скрытия/показа поиска
  initAnimation(): void {
    if (this.showSearch) {
      this.animationState = 'show';
    } else {
      this.animationState = 'hide';
    }
  }


  // иниц-я формы для хранения периоды дат (для фильтрации)
  initDateRangeForm(): void {
    this.dateRangeForm = new FormGroup({
      dateFrom: new FormControl(),
      dateTo: new FormControl()
    });

    // подписываемся на события изменения дат
    // (т.к. в текущей версии компонента mat-date-range-input нет соотв. события, которое можно обработать
    this.dateFrom.valueChanges.subscribe(() => this.checkFilterChanged());
    this.dateTo.valueChanges.subscribe(() => this.checkFilterChanged());
  }


  // проверяет, были ли изменены какие-либо параметры поиска (по сравнению со старым значением)
  checkFilterChanged(): boolean {

    if (!this.taskSearchValues) {
      return;
    }

    this.filterChanged = false;


    // поочередно проверяем все фильтры (текущее введенное значение с последним сохраненным)
    if (this.taskSearchValues.title !== this.filterTitle) {
      this.filterChanged = true;
    }

    if (this.taskSearchValues.completed !== this.filterCompleted) {
      this.filterChanged = true;
    }

    if (this.taskSearchValues.priorityId !== this.filterPriorityId) {
      this.filterChanged = true;
    }

    if (this.taskSearchValues.sortColumn !== this.filterSortColumn) {
      this.filterChanged = true;
    }

    if (this.taskSearchValues.sortDirection !== this.filterSortDirection) {
      this.filterChanged = true;
    }

    if (this.taskSearchValues.dateFrom !== this.dateFrom.value) {
      this.filterChanged = true;
    }

    if (this.taskSearchValues.dateTo !== this.dateTo.value) {
      this.filterChanged = true;
    }

    return this.filterChanged;

  }


  // выбрать правильную иконку (убывание, возрастание) для отображения на странице
  initSortDirectionIcon(): void {

    if (this.filterSortDirection === 'desc') {
      this.sortIconName = this.iconNameDown;
    } else {
      this.sortIconName = this.iconNameUp;
    }
  }


  // изменили направление сортировки
  changedSortDirection(): void {

    // filterSortDirection затем записывается в taskSearchValues
    if (this.filterSortDirection === 'asc') {
      this.filterSortDirection = 'desc';
    } else {
      this.filterSortDirection = 'asc';
    }

    this.initSortDirectionIcon(); // применяем правильную иконку

  }

  // проинициализировать локальные переменные поиска
  initSearchValues(): void {

    if (!this.taskSearchValues) {
      return;
    }

    // эти локальные переменные показываются на html странице
    this.filterTitle = this.taskSearchValues.title;
    this.filterCompleted = this.taskSearchValues.completed;
    this.filterPriorityId = this.taskSearchValues.priorityId;
    this.filterSortColumn = this.taskSearchValues.sortColumn;
    this.filterSortDirection = this.taskSearchValues.sortDirection;

    // форма для хранения данных календаря (фильтрация задач по периоду)
    if (this.taskSearchValues.dateFrom) {
      this.dateFrom.setValue(this.taskSearchValues.dateFrom);
    }

    if (this.taskSearchValues.dateTo) {
      this.dateTo.setValue(this.taskSearchValues.dateTo);
    }

  }

  // сбросить локальные переменные поиска
  clearSearchValues(): void {
    this.filterTitle = '';
    this.filterCompleted = null;
    this.filterPriorityId = null;
    this.filterSortColumn = this.defaultSortColumn;
    this.filterSortDirection = this.defaultSortDirection;
    this.clearDateRange(); // очистить период даты
  }

  // очистка дат в фильтре поиска
  clearDateRange(): void {
    this.dateFrom.setValue(null);
    this.dateTo.setValue(null);
  }

  // показать/скрыть инструменты поиска
  onToggleSearch(): void {

    this.toggleSearchEvent.emit(!this.showSearch);

  }


  // параметры поиска
  initSearch(): void {

    // сохраняем значения перед поиском - записываем все выбранные значения пользователя
    this.taskSearchValues.title = this.filterTitle;
    this.taskSearchValues.completed = this.filterCompleted;
    this.taskSearchValues.priorityId = this.filterPriorityId;
    this.taskSearchValues.sortColumn = this.filterSortColumn;
    this.taskSearchValues.sortDirection = this.filterSortDirection;
    this.taskSearchValues.dateTo = this.dateTo.value; // даты берем из полей формы
    this.taskSearchValues.dateFrom = this.dateFrom.value;

    this.searchActionEvent.emit(this.taskSearchValues);

    this.filterChanged = false; // сбрасываем флаг изменения

    if (this.isMobile){
      this.onToggleSearch(); // для моб. версии после нажатия на кнопку поиска - скрываем поиск
    }


  }


}

