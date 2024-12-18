import {Component, Inject, Input, OnInit, Output} from '@angular/core';
import {DeviceDetectorService} from 'ngx-device-detector';
import {EditCategoryDialogComponent} from '../../dialog/edit-category-dialog/edit-category-dialog.component';
import {TranslateService} from '@ngx-translate/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {DialogAction} from '../../dialog/DialogResult';
import {EventEmitter} from '@angular/core';
import {CategorySearchValues} from '../../../data/model/SearchObjects';
import {Category, Stat} from '../../../data/model/Model';
import {User} from '../../../../oauth2/model/User';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})

// "presentational component": отображает полученные данные и отправляет какие-либо действия обработчику
// назначение - работа с категориями
// класс не видит dataHandler, т.к. напрямую с ним не должен работать
export class CategoriesComponent implements OnInit {

  // компонент взаимодействует с "внешним миром" только через @Input() и @Output !!!

  // принцип инкапсуляции и "слабой связи"
  // (Low Coupling) из GRASP —
  // General Responsibility Assignment Software Patterns (основные шаблоны распределения обязанностей в программном обеспечении)
  // с помощью @Output() сигнализируем о том, что произошло событие выбора категории (кто будет это обрабатывать - компонент не знает)


  // ---------------------------------------------------

  // сеттеры используются для доп. функционала - чтобы при изменении значения вызывать нужные методы
  // а так можно использовать и обычные переменные

  @Input('user')
  set setUser(user: User) {
    this.user = user;
  }

  @Input('categories')
  set setCategories(categories: Category[]) {
    this.categories = categories; // категории для отображения
  }

  @Input('categorySearchValues')
  set setCategorySearchValues(categorySearchValues: CategorySearchValues) {
    this.categorySearchValues = categorySearchValues;
  }

  @Input('selectedCategory')
  set setCategory(selectedCategory: Category) {
    this.selectedCategory = selectedCategory;
  }

  // общая статистика
  @Input('stat')
  set statVar(stat: Stat) {
    this.stat = stat;
  }



  // добавление категории
  @Output()
  addCategoryEvent = new EventEmitter<Category>(); // передаем только название новой категории

  // изменение категории
  @Output()
  updateCategoryEvent = new EventEmitter<Category>();

  // удаление категории
  @Output()
  deleteCategoryEvent = new EventEmitter<Category>();

  // поиск категории
  @Output()
  searchCategoryEvent = new EventEmitter<CategorySearchValues>(); // передаем строку для поиска

  // закрыть меню
  @Output()
  toggleMenuEvent = new EventEmitter(); // передаем строку для поиска

  // выбрали категорию из списка
  @Output()
  selectCategoryEvent = new EventEmitter<Category>();


  // -------------------------------------------------------------------------
  // обычные переменные желательно отделять от @Input и @Output

  isMobile: boolean; // зашли на сайт с мобильного устройства или нет?

  categories: Category[]; // категории для отображения

  // для отображения иконки редактирования при наведении на категорию (десктоп версия)
  indexCategoryMouseOver: number;
  showEditIconCategoryIcon: boolean; // показывать ли иконку редактирования категории (иниц-ся в смарт компоненте main)

  // для поиска категорий
  searchTitle: string; // текст для поиска категорий
  filterChanged: boolean; // были ли изменения в параметре поиска
  categorySearchValues: CategorySearchValues; // параметры поиска категорий

  // выбранная категория - если равно null - будет выбираться категория 'Все'
  // (задачи любой категории (и пустой в т.ч.))
  selectedCategory: Category;

  user: User; // текущий пользователь

  // общая статистика
  stat: Stat;

  constructor(
    private dialogRef: MatDialogRef<EditCategoryDialogComponent>, // для работы с текущим диалог. окном
    @Inject(MAT_DIALOG_DATA) private data: [Category, string], // данные, которые можем передать в диалоговое окно
    private dialogBuilder: MatDialog, // для открытия нового диалогового окна (из текущего)
    private translate: TranslateService, // локализация
    private deviceService: DeviceDetectorService, // определение устройства
  ) {
    this.isMobile = deviceService.isMobile();
  }

  ngOnInit(): void {
  }


  // диалоговое окно для добавления новой категории
  openAddDialog(): void {

    // открытие диалог. окна
    this.dialogRef = this.dialogBuilder.open(EditCategoryDialogComponent, {
      // передаем новый пустой объект для заполнения
      data: [new Category(null, '', this.user), this.translate.instant('CATEGORY.ADDING')],
      width: '400px'
    });


    // подписываемся на закрытие диалог. окна
    this.dialogRef.afterClosed().subscribe(result => {

      if (!(result)) { // если просто закрыли окно, ничего не нажав
        return;
      }

      if (result.action === DialogAction.SAVE) { // если нажали Сохранить
        this.addCategoryEvent.emit(result.obj as Category); // вызываем внешний обработчик
      }
    });


  }


  // сохраняет индекс записи категории, над который в данный момент проходит мышка (и там отображается иконка редактирования)
  updateEditIconVisible(show: boolean, index: number): void {

    this.showEditIconCategoryIcon = show; // показать или скрыть иконку
    this.indexCategoryMouseOver = index; // для того понимать - над каким элементом мы находимся

  }


  // диалоговое окно для редактирования категории
  openEditDialog(category: Category): void {

    this.dialogRef = this.dialogBuilder.open(EditCategoryDialogComponent, {
      // передаем копию объекта, чтобы все изменения не касались оригинала (чтобы их можно было отменить)
      data: [new Category(category.id, category.title, this.user), this.translate.instant('CATEGORY.EDITING')],
      width: '400px'
    });

    // подписываемся на закрытие диалог. окна
    this.dialogRef.afterClosed().subscribe(result => {

      if (!(result)) { // если просто закрыли окно, ничего не нажав
        return;
      }

      if (result.action === DialogAction.DELETE) { // нажали удалить
        this.deleteCategoryEvent.emit(category); // вызываем внешний обработчик
        return;
      }

      if (result.action === DialogAction.SAVE) { // нажали сохранить (обрабатывает как добавление, так и удаление)
        this.updateCategoryEvent.emit(result.obj as Category); // вызываем внешний обработчик
        return;
      }
    });
  }


  // очистить поле поиска и заново обновить список категорий
  clearAndSearch(): void {
    this.searchTitle = null;
    this.search(); // поиск с пустым значением  searchTitle вернет все категории
  }

  // проверяет, были ли изменены какие-либо параметры поиска (по сравнению со старым значением)
  checkFilterChanged(): void {
    this.filterChanged = this.searchTitle !== this.categorySearchValues.title;
  }


// поиск категории
  search(): void {

    this.filterChanged = false; // сбросить

    if (!this.categorySearchValues) { // если объект с параметрами поиска непустой
      return;
    }

    this.categorySearchValues.title = this.searchTitle; // сохраняем в переменную введенный текст пользователя
    this.searchCategoryEvent.emit(this.categorySearchValues);

  }


  // проверяет остались ли символы в текстовом поле
  checkEmpty(): void {
    if (this.searchTitle.trim().length === 0) {
      this.search(); // автоматически произвести поиск категорий (сброс всех значений)
    }
  }

  toggleMenu(): void {
    this.toggleMenuEvent.emit(); // закрыть меню
  }


  // выбираем категорию для отображения соотв. задач
  showCategory(category: Category): void {

    // если не изменилось значение, ничего не делать (чтобы лишний раз не делать запрос данных)
    if (this.selectedCategory === category) {
      return;
    }

    this.selectedCategory = category; // сохраняем выбранную категорию
    this.selectCategoryEvent.emit(this.selectedCategory); // вызываем внешний обработчик и передаем выбранную категорию

    // для моб. версии после нажатия на категориб - скрываем меню
    if (this.isMobile){
      this.toggleMenu();
    }

  }


}
