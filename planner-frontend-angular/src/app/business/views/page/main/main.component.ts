import {TaskService} from '../../../data/dao/impl/TaskService';
import {PriorityService} from '../../../data/dao/impl/PriorityService';
import {CategoryService} from '../../../data/dao/impl/CategoryService';
import {StatService} from '../../../data/dao/impl/StatService';
import {DashboardData} from '../../../object/DashboardData';
import {CategorySearchValues, TaskSearchValues} from '../../../data/model/SearchObjects';
import {TranslateService} from '@ngx-translate/core';
import {PageEvent} from '@angular/material/paginator';
import {DeviceDetectorService} from 'ngx-device-detector';
import {Component, OnInit} from '@angular/core';
import {CookieUtils} from '../../../utils/CookieUtils';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../../environments/environment';
import {Observable} from 'rxjs';
import {Category, Priority, Stat, Task} from '../../../data/model/Model';
import {MatDrawerMode} from '@angular/material/sidenav';
import {SpinnerService} from '../../../../oauth2/spinner/spinner.service';
import {BffService} from '../../../../oauth2/bff/BffService';
import {User} from '../../../../oauth2/model/User';


export const LANG_RU = 'ru';
export const LANG_EN = 'en';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  // тип устройства
  isMobile: boolean; // смартфон
  isTablet: boolean; // планшет

  user: User = null; // текущий пользователь (аккаунт) - получаем только его данные - по email

  // параметры бокового меню с категориями
  menuOpened = true; // открыть-закрыть
  menuMode: MatDrawerMode; // тип выдвижения (поверх, с толканием и пр.)
  menuPosition: string; // позиция меню
  showBackdrop: boolean; // показывать ли затемнение экрана при открытии меню


  tasks: Task[]; // текущие задачи для отображения на странице
  priorities: Priority[]; // приоритеты для отображения
  categories: Category[]; // категории для отображения и фильтрации

  isLoading: boolean; // идет ли сейчас загрузка или нет (для отображения иконки загрузки)

  showStat = true;   // показать/скрыть статистику

  // контейнеры с параметрами для поиска данных
  categorySearchValues = new CategorySearchValues(); // для поиска категорий (в том числе для отображения всех категорий)
  taskSearchValues: TaskSearchValues; // экземпляр создаем позже, когда подгрузим данные из cookies

  // если равно null - по-умолчанию будет выбираться категория 'Все'
  selectedCategory: Category = null; // выбранная категория (фильтрует задачи только выбранной категории)


  dash: DashboardData = new DashboardData(); // данные для отображения дашбоарда статистики
  stat: Stat; // данные общей статистики - entity класс для получения объекта из backend

  // сколько всего найдено задач после поиска (для постраничного отображения важно знать сколько вообще записей найдено)
  totalTasksFound: number;

  // дефолтные значения для постраничности
  readonly defaultPageSize = 5; // сколько данных отображать на странице
  readonly defaultPageNumber = 0; // активная открытая страница (первая, индекс с нуля)

  showSearch = false; // область поиска

  // утилита для работы с cookies - сразу создаем объект, т.к. он нужен для загрузки начальных значений
  cookiesUtils = new CookieUtils();

  // названия cookies
  readonly cookieTaskSeachValues = 'todo:searchValues'; // для сохранения параметров поиска в формате JSON
  readonly cookieShowStat = 'todo:showStat'; // показывать или нет статистику
  readonly cookieShowMenu = 'todo:showMenu'; // показывать или нет статистику
  readonly cookieShowSearch = 'todo:showSearch'; // показывать или нет инструменты поиска
  readonly cookieLang = 'todo:lang'; // язык интерфейса

  spinner: SpinnerService; // индикатор загрузки в центре экрана (при каждом HTTP запросе)


  constructor(
    // сервисы для работы с данными (фасад)
    private userService: BffService,
    private taskService: TaskService,
    private categoryService: CategoryService,
    private priorityService: PriorityService,
    private statService: StatService,
    private deviceService: DeviceDetectorService, // для определения типа устройства (моб., десктоп, планшет)
    private translate: TranslateService, // для локализации
    private spinnerService: SpinnerService, // индикатор загрузки в центре экрана (при каждом HTTP запросе)
    private router: Router, // навигация, общие параметры перехода на веб страницу
    private http: HttpClient // для веб запросов
  ) {


  }


  ngOnInit(): void {

    // напрямую к spinnerService нельзя обратиться из html, т.к. private, поэтому создаем свою переменную
    this.spinner = this.spinnerService;

    // определяем тип устройства
    this.isMobile = this.deviceService.isMobile();
    this.isTablet = this.deviceService.isTablet();


    // в "реактивном коде" не рекомендуется вкладывать subscribe друг в друга.
    // но чтобы не усложнять код цепочками rxjs (новички путаются в нем), сделал попроще

    this.initSidebar(); // начальная загрузка ng-sidebar

    this.initLangCookie(); // установить язык интерфейса

    this.initData(); // получаем данные пользователя (категории, задачи и пр.)


  }

  // показать все данные конкретного пользователя
  private initData(): void {

    // сначала нужно получить данные пользователя
    this.requestUserProfile().subscribe(
      {
        // успешное выполнение
        next: ((response: User) => {

          // текущий пользователь
          this.user = response;

          this.categorySearchValues.email = this.user.email; // email для поиска категорий


          // заполнить категории
          this.categoryService.findAll(this.user.email).subscribe(res => {
            this.categories = res;

            // заполнить приоритеты
            this.priorityService.findAll(this.user.email).subscribe(prior => {
              this.priorities = prior;
            });


            if (!this.initSearchCookie()) { // загружаем все куки, чтобы восстановить состояние приложения

              // если куки не загрузились или их нет (вернулось false),
              // то устанавливаем значения по-умолчанию для этих 2-х обяз. параметров,
              // чтобы запрос в БД обработал корректно (иначе будет ошибка)
              // остальные параметры могут быть null
              this.taskSearchValues = new TaskSearchValues();
              this.taskSearchValues.pageSize = this.defaultPageSize; // обязательный параметр, не должен быть пустым
              this.taskSearchValues.pageNumber = this.defaultPageNumber; // обязательный параметр, не должен быть пустым
            }

            if (this.isMobile) { // для мобильной версии никогда не показываем статистику
              this.showStat = false;
            } else {
              this.initShowStatCookie(); // кук - показывать или нет общую статистику сверху
            }

            this.initShowSearchCookie(); // кук - показывать или нет инструменты поиска

            // первоначальное отображение задач при загрузке приложения
            // запускаем только после выполнения статистики (т.к. понадобятся ее данные) и загруженных категорий
            this.selectCategory(this.selectedCategory); // selectedCategory может быть загружен из кука (если был сохранен)


          });


        }),

        // выполнение с ошибкой
        error: (error => {
          console.log(error);

          // пытаемся обменять Refresh Token на Access Token
          this.exchangeRefreshToken();

        })
      }
    );


  }


  // начальное отображение левого меню (sidebar)
  initSidebar(): void {

    this.menuPosition = 'left'; // меню слева

    // настройки бокового меню для моб. и десктоп вариантов
    if (this.isMobile) {
      this.menuOpened = false; // на моб. версии по-умолчанию меню будет закрыто
      this.menuMode = 'over'; // поверх всего контента
      this.showBackdrop = true; // если нажали на область вне меню - закрыть его
    } else { // если это десктоп

      this.initShowMenuCookie(); // НЕ в моб. версии загружаем значение из кука
      this.menuMode = 'side'; // будет "толкать" основной контент, а не закрывать его
      this.showBackdrop = false;
    }

  }

  // показать-скрыть меню
  toggleMenu(): void {
    this.menuOpened = !this.menuOpened; // изменяем значение на обратное

    // сохраняем в cookies текущее значение
    this.cookiesUtils.setCookie(this.cookieShowMenu, String(this.menuOpened));
  }


  // добавление категории
  addCategory(category: Category): void {
    this.categoryService.add(category).subscribe(result => {
        this.searchCategory(this.categorySearchValues); // обновить список категорий
      }
    );
  }

  // обновлении категории
  updateCategory(category: Category): void {
    this.categoryService.update(category).subscribe(() => {
      this.searchCategory(this.categorySearchValues); // обновляем список категорий
      this.selectCategory(this.selectedCategory);
    });
  }


  // поиск категории
  searchCategory(categorySearchValues: CategorySearchValues): void {
    this.categoryService.findCategories(categorySearchValues).subscribe(result => {
      this.categories = result; // автоматически обновится список на HTML странице
    });

  }


  // удаление категории
  deleteCategory(category: Category): void {

    // если мы находимся в меню категории и ее же удаляем
    if (this.selectedCategory && category.id === this.selectedCategory.id) {
      this.selectedCategory = null; // тогда сбрасываем - выбираем категорию "Все"
    }

    this.categoryService.delete(category.id).subscribe(cat => {
      this.searchCategory(this.categorySearchValues); // обновляем список категорий
      this.selectCategory(this.selectedCategory);
    });
  }


  // выбрали/изменили категорию (нужно показать соотв. задачи и выполнить другие нужные действия)
  selectCategory(category: Category): void {

    this.selectedCategory = category; // запоминаем выбранную категорию, чтобы передать потом в смарт компонент main

    // т.к. выбрали конкретную категорию, то показываем задачи данной категории с первой страницы
    this.taskSearchValues.pageNumber = 0;

    // для поиска задач по данной категории
    this.taskSearchValues.categoryId = category ? category.id : null; // (если category == null, то будут показаны все задачи)

    // обновить список задач согласно выбранной категории и другим параметрам поиска из taskSearchValues
    this.searchTasks(this.taskSearchValues);


    // обновляем статистику

    // если выбрали какую-то категорию, а не пункт Все
    if (this.selectedCategory != null) { // обновляем статистику дешбоарда вверху страницы - данными категории
      this.categoryService.findById(category.id).subscribe( // получаем обновленную статистику по категории
        (cat: Category) => {

          this.selectedCategory = cat;

          // обновляем общую статистику (используется для счетчика в счетчике в меню для пункта Все и также для дешбоарда, при выборе пункта Все)
          this.statService.getOverallStat(this.user.email).subscribe((result => { // получить общую статистику
              this.stat = result; // результат выполнения сервиса

              // заполняем дешбоард статистикой выбранной категории
              this.dash.completedTotal = this.selectedCategory.completedCount;
              this.dash.uncompletedTotal = this.selectedCategory.uncompletedCount;

            }
          ));

        }
      );
    } else { // если выбрали пункт Все (а не конкретную статистику)
      this.statService.getOverallStat(this.user.email).subscribe((result => { // получить общую статистику
          this.stat = result; // результат выполнения сервиса

          // заполняем дешбоард данными общей статистики
          this.dash.completedTotal = this.stat.completedTotal;
          this.dash.uncompletedTotal = this.stat.uncompletedTotal;


        }
      ));
    }

  }


  // показать-скрыть статистику
  toggleStat(showStat: boolean): void {
    this.showStat = showStat;

    // сохраняем в cookies текущее значение
    this.cookiesUtils.setCookie(this.cookieShowStat, String(showStat));

  }


  // поиск задач (если параметры равны null - найдутся все задачи пользователя)
  searchTasks(searchTaskValues: TaskSearchValues): void {

    // сохраняем в cookies текущее значение
    this.cookiesUtils.setCookie(this.cookieTaskSeachValues, JSON.stringify(this.taskSearchValues));

    this.taskSearchValues = searchTaskValues;
    this.taskSearchValues.email = this.user.email; // залогиненный пользователь (чтобы получить только его задачи)

    this.taskService.findTasks(this.taskSearchValues).subscribe(result => { // в result запишется объект pageable из backend

      this.totalTasksFound = result.totalElements; // сколько данных показывать на странице
      this.tasks = result.content; // массив задач


    });


  }


  // обновить общую статистику вверху страницы
  // также обновится цифра в левом меню для категории Все
  // updateDashboardStat(): void {
  //
  //
  //
  // }


  // // обновить статистику конкретной категории (и показать эти данные в дашборде, если выбрана эта категория)
  // updateCategoryInMenu(category: Category): void {
  //
  //
  //
  // }

  // обновление задачи
  updateTask(task: Task): void {

    // более правильно - реализовать код ниже с помощью цепочки rxjs (чтобы выполнялось последовательно и с условиями),
    // но решил сильно не усложнять

    this.taskService.update(task).subscribe(result => {
      this.searchCategory(this.categorySearchValues);
      this.selectCategory(this.selectedCategory);
    });

  }


  // удаление задачи
  deleteTask(task: Task): void {

    // более правильно - реализовать код ниже с помощью цепочки rxjs (чтобы выполнялось последовательно и с условиями),
    // но решил сильно не усложнять

    this.taskService.delete(task.id).subscribe(result => {

      this.searchCategory(this.categorySearchValues);
      this.selectCategory(this.selectedCategory);

    });

  }


  // добавление задачи
  addTask(task: Task): void {
    task.user = this.user; // для какого пользователя добавляем

    // более правильно - реализовать код ниже с помощью цепочки rxjs (чтобы выполнялось последовательно и с условиями),
    // но решил сильно не усложнять

    this.taskService.add(task).subscribe(result => {

      this.searchCategory(this.categorySearchValues); // обновляем список категорий
      this.selectCategory(this.selectedCategory); //

    });


  }


  // изменили кол-во элементов на странице или перешли на другую страницу
  // с помощью paginator
  paging(pageEvent: PageEvent): void {

    // если изменили настройку "кол-во элементов на странице" - заново делаем запрос и показываем с 1й страницы
    if (this.taskSearchValues.pageSize !== pageEvent.pageSize) {
      this.taskSearchValues.pageNumber = 0; // новые данные будем показывать с 1-й страницы (индекс 0)
    } else {
      // если просто перешли на другую страницу
      this.taskSearchValues.pageNumber = pageEvent.pageIndex; // считываем измененный pageNumber
    }

    this.taskSearchValues.pageSize = pageEvent.pageSize;

    this.searchTasks(this.taskSearchValues); // показываем новые данные
  }



  // показать-скрыть поиск
  toggleSearch(showSearch: boolean): void {

    this.showSearch = showSearch; // сохраняем в локальную переменную, чтобы потом сохранить ее в кук

    // сохраняем в cookies текущее значение
    this.cookiesUtils.setCookie(this.cookieShowSearch, String(showSearch));

  }

  // найти из cookies все параметры поиска, чтобы восстановить все окно
  initSearchCookie(): boolean {

    const cookie = this.cookiesUtils.getCookie(this.cookieTaskSeachValues);


    if (!cookie) { // кук не был найден
      return false;
    }

    const cookieJSON = JSON.parse(cookie);

    if (!cookieJSON) { // кук был сохранен не в формате JSON
      return false;
    }

    // важно тут создавать новый экземпляр, чтобы Change Detector в tasks.component увидел, что ссылка изменилась,
    // и обновил свои данные.
    // сделано для упрощения


    if (!this.taskSearchValues) {
      this.taskSearchValues = new TaskSearchValues();
    }

    // размер страницы
    const tmpPageSize = cookieJSON.pageSize;
    if (tmpPageSize) {
      this.taskSearchValues.pageSize = Number(tmpPageSize); // конвертируем строку в число
    }


    // выбранная категория
    const tmpCategoryId = cookieJSON.categoryId;
    if (tmpCategoryId) {
      this.taskSearchValues.categoryId = Number(tmpCategoryId);
      this.selectedCategory = this.getCategoryFromArray(tmpCategoryId); // записываем в переменную какая была выбрана категория
    }


    // выбранный приоритет
    const tmpPriorityId = cookieJSON.priorityId as number;
    if (tmpPriorityId) {
      this.taskSearchValues.priorityId = Number(tmpPriorityId);
    }

    // текст поиска
    const tmpTitle = cookieJSON.title;
    if (tmpTitle) {
      this.taskSearchValues.title = tmpTitle;
    }


    // статус задачи - может принимать значения: null - все, 0 - незавершенные, 1 - завершенные
    const tmpCompleted = cookieJSON.completed as number;
    if (tmpCompleted >= 0) {
      this.taskSearchValues.completed = tmpCompleted;
    }

    // столбец сортировки
    const tmpSortColumn = cookieJSON.sortColumn;
    if (tmpSortColumn) {
      this.taskSearchValues.sortColumn = tmpSortColumn;
    }

    // направление сортировки
    const tmpSortDirection = cookieJSON.sortDirection;
    if (tmpSortDirection) {
      this.taskSearchValues.sortDirection = tmpSortDirection;
    }

    // Дата С
    const tmpDateFrom = cookieJSON.dateFrom;
    if (tmpDateFrom) {
      this.taskSearchValues.dateFrom = new Date(tmpDateFrom);
    }


    // Дата ПО
    const tmpDateTo = cookieJSON.dateTo; // название поля в классе с префиксом
    if (tmpDateTo) {
      this.taskSearchValues.dateTo = new Date(tmpDateTo);
    }


    // номер страницы можно не сохранять/восстанавливать
    // также можно не сохранять параметры поиска категорий, чтобы при восстановлении приложения показывались все категории

    return true; // кук был найден и загружен
  }


  // находит индекс элемента (по id) в локальном массиве
  getCategoryFromArray(id: number): Category {
    const tmpCategory = this.categories.find(t => t.id === id);
    return tmpCategory;
  }

  // загружаем кук - чтобы указать язык интерфейса
  initLangCookie(): void {

    const val = this.cookiesUtils.getCookie(this.cookieLang);
    if (val) { // если кук найден
      this.translate.use(val); // переключение языка
    } else {
      this.translate.use(LANG_RU);
    }

  }

  // загружаем кук - показать меню или нет
  initShowMenuCookie(): void {
    const val = this.cookiesUtils.getCookie(this.cookieShowMenu);
    if (val) { // если кук найден
      this.menuOpened = (val === 'true'); // конвертация из string в boolean
    }

  }


  // загружаем кук - показать поиск или нет
  initShowSearchCookie(): void {
    const val = this.cookiesUtils.getCookie(this.cookieShowSearch);
    if (val) { // если кук найден
      this.showSearch = (val === 'true'); // конвертация из string в boolean
    }

  }

  // загружаем кук - показать статистику или нет
  initShowStatCookie(): void {
    if (!this.isMobile) { // если моб. устройство, то не показывать статистику
      const val = this.cookiesUtils.getCookie(this.cookieShowStat);
      if (val) { // если кук найден
        this.showStat = (val === 'true'); // конвертация из string в boolean
      }
    }
  }


  // были ли изменены настройки приложения
  settingsChanged(priorities: Priority[]): void { // priorities - измененный список приоритетов

    this.priorities = priorities; // получаем измененный массив с приоритетами
    this.searchTasks(this.taskSearchValues); // обновить текущие задачи и категории для отображения

    // сохраняем в cookies текущий выбранный язык
    this.cookiesUtils.setCookie(this.cookieLang, this.translate.currentLang);

  }

  // запрос полных данных пользователя (профайл)
  private requestUserProfile(): Observable<User> {

    return this.http.get<User>(environment.bffURI + '/profile');

  }

  // переходим на страницу авторизации
  private redirectLoginPage(): void {

    this.router.navigate(['/login']);
  }


  // пытаемся обменять RT на AT
  private exchangeRefreshToken(): void {
    this.userService.exchangeRefreshToken().subscribe(
      {

        // если получили токены
        next: (() => {
          this.ngOnInit(); // обновляем страницу и данные
        }),


        // выполнение с ошибкой
        error: (err => {
          console.log(err);

          // если не смогли получить токены - выходим на страницу логина, чтобы запустить заново весь процесс авторизации
          this.redirectLoginPage();

        })
      }
    );
  }

  // выход из системы, удаление куков, удаление сессий в KeyCloak
  logoutAction(): void {
    this.userService.logoutAction().subscribe({

      // успешно завершилось или с ошибкой - в любом случае переходим на главную страницу
      complete: (() => {
        this.redirectLoginPage();
      }),
    });

  }


  // // обновляет дешбоард с общей статистикой вверху страницы
  // private updateDashboard(): void {
  //   // если в данный момент в меню выбрали какую-либо категорию (а не пункт Все), то заполняем дешбоард статистикой выбранной категории
  //   if (this.selectedCategory != null) {
  //
  //     console.log('1');
  //
  //     // заполняем дешбоард
  //     this.dash.completedTotal = this.selectedCategory.completedCount;
  //     this.dash.uncompletedTotal = this.selectedCategory.uncompletedCount;
  //
  //   } else { // если выбран пункт меню Все (а не конкретная категория) - то заполняем дешбоард данными общей статистики
  //     this.statService.getOverallStat(this.user.email).subscribe((result => { // получить общую статистику
  //         this.stat = result; // результат выполнения сервиса
  //         console.log('2');
  //
  //         // заполняем дешбоард
  //         this.dash.completedTotal = this.stat.completedTotal;
  //         this.dash.uncompletedTotal = this.stat.uncompletedTotal;
  //       }
  //     ));
  //   }
  // }
}


