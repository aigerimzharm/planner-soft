import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './oauth2/login/login.component';
import {MainComponent} from './business/views/page/main/main.component';


/*

Модуль для настройки всех роутингов (Routing)

Роутинг связывает URI (ссылки, по которым переходит пользователь) и компоненты (страницы)

При переходе по какому либо адресу - произойдет перенаправление на нужный компонент (страницу)

https://angular.io/guide/router


 */


// список всех роутов и связанных компонентов (маппинг)
const routes: Routes = [

  {path: '', component: LoginComponent}, // главная
  {path: 'login', component: LoginComponent}, // главная
  {path: 'index', redirectTo: '', pathMatch: 'full'}, // главная
  {path: 'main', component: MainComponent },

];


@NgModule({
  imports: [
    RouterModule.forRoot(routes) // без этого работать не будет - импортирует системный модуль
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
