import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppComponent} from './app.component';
import {LoginComponent} from './oauth2/login/login.component';
import {AppRoutingModule} from './app-routing.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MainComponent} from './business/views/page/main/main.component';
import {TASK_URL_TOKEN} from './business/data/dao/impl/TaskService';
import {CATEGORY_URL_TOKEN} from './business/data/dao/impl/CategoryService';
import {PRIORITY_URL_TOKEN} from './business/data/dao/impl/PriorityService';
import {STAT_URL_TOKEN} from './business/data/dao/impl/StatService';
import {environment} from '../environments/environment';
import {CategoriesComponent} from './business/views/page/categories/categories.component';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {MatIconModule} from '@angular/material/icon';
import {registerLocaleData} from '@angular/common';
import {MultiTranslateHttpLoader} from 'ngx-translate-multi-http-loader';
import localeRu from '@angular/common/locales/ru';
import {EditCategoryDialogComponent} from './business/views/dialog/edit-category-dialog/edit-category-dialog.component';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatNativeDateModule, MatOptionModule} from '@angular/material/core';
import {MatPaginatorIntl, MatPaginatorModule} from '@angular/material/paginator';
import {MatInputModule} from '@angular/material/input';
import {MatRadioModule} from '@angular/material/radio';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatMenuModule} from '@angular/material/menu';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatTabsModule} from '@angular/material/tabs';
import {MatButtonModule} from '@angular/material/button';
import {ConfirmDialogComponent} from './business/views/dialog/confirm-dialog/confirm-dialog.component';
import {HeaderComponent} from './business/views/page/header/header.component';
import {StatCardComponent} from './business/views/page/stat/stat-card/stat-card.component';
import {StatComponent} from './business/views/page/stat/stat.component';
import {TaskListComponent} from './business/views/page/tasks/tasks.component';
import {EditTaskDialogComponent} from './business/views/dialog/edit-task-dialog/edit-task-dialog.component';
import {TaskDatePipe} from './business/pipe/task-date.pipe';
import {TasksMatPaginatorIntl} from './business/intl/TasksMatPaginatorIntl';
import {SettingsDialogComponent} from './business/views/dialog/settings-dialog/settings-dialog.component';
import {EditPriorityDialogComponent} from './business/views/dialog/edit-priority-dialog/edit-priority-dialog.component';
import {PrioritiesComponent} from './business/views/page/priorities/priorities.component';
import {ColorPickerModule} from 'ngx-color-picker';
import {FooterComponent} from './business/views/page/footer/footer.component';
import {AboutDialogComponent} from './business/views/dialog/about-dialog/about-dialog.component';
import {CookiesInterceptor} from './oauth2/interceptor/cookies-interceptor.service';
import {SpinnerInterceptor} from './oauth2/interceptor/spinner-interceptor.service';

// файл отвечает за настройку Angular модуля - какие другие модули подключать, константы, системные настройки и пр.

registerLocaleData(localeRu);


// для загрузки переводов по сети
function HttpLoaderFactory(httpClient: HttpClient): MultiTranslateHttpLoader {
  return new MultiTranslateHttpLoader(httpClient, [
    {prefix: environment.frontendURL + '/assets/i18n/', suffix: '.json'} // путь к папке и суффикс файлов
  ]);
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MainComponent,
    CategoriesComponent,
    EditCategoryDialogComponent,
    ConfirmDialogComponent,
    HeaderComponent,
    StatCardComponent,
    StatComponent,
    TaskListComponent,
    EditTaskDialogComponent,
    TaskDatePipe,
    SettingsDialogComponent,
    EditPriorityDialogComponent,
    PrioritiesComponent,
    FooterComponent,
    AboutDialogComponent
  ],
  imports: [
    BrowserModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatOptionModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    HttpClientModule,
    MatSidenavModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory, // для загрузки  переводов по сети
        deps: [HttpClient]
      }
    }),
    MatTabsModule,
    MatRadioModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatMenuModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatCheckboxModule,
    ColorPickerModule,

  ],
  providers: [ // инициализация системных объектов с нужными параметрами

    /* нужно указывать для корректной работы диалоговых окон */
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} },
    {
      provide: TASK_URL_TOKEN,
      useValue: environment.resourceServerURL + '/task'
    },
    {
      provide: CATEGORY_URL_TOKEN,
      useValue: environment.resourceServerURL + '/category'
    },
    {
      provide: PRIORITY_URL_TOKEN,
      useValue: environment.resourceServerURL + '/priority'
    },
    {
      provide: STAT_URL_TOKEN,
      useValue: environment.resourceServerURL + '/stat'
    },
    {
      provide: MatPaginatorIntl, useClass: TasksMatPaginatorIntl
    },

    {
      provide: HTTP_INTERCEPTORS, // все HTTP запросы будут выполняться с отображением индикатора загрузки
      useClass: SpinnerInterceptor,
      multi: true
    },

    {
      provide: HTTP_INTERCEPTORS, // все HTTP запросы будут отправлять защищенные куки
      useClass: CookiesInterceptor,
      multi: true
    },

  ],
  entryComponents: [ // https://angular.io/guide/entry-components
    EditCategoryDialogComponent,
    ConfirmDialogComponent,
    EditTaskDialogComponent,
    SettingsDialogComponent,
    EditPriorityDialogComponent,
    AboutDialogComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
