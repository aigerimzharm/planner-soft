

/*

Классы (объекты) для запросов и их результатов, которые автоматически будут преобразовываться в JSON.

Это аналог entity классов из backend проекта (в упрощенном виде)

Основные поля должны совпадать один в один с POJO из backend, чтобы автоматическая конвертация JSON работала корректно.

Последовательности и типы полей - должны совпадать.

*/


import {User} from '../../../oauth2/model/User';

export class Category {
  id: number;
  title: string;
  completedCount: number;
  uncompletedCount: number;
  user: User;

  // ? означает необязательный для передачи параметр
  constructor(id: number, title: string, user: User, completedCount?: number,  uncompletedCount?: number) {
    this.id = id;
    this.title = title;
    this.completedCount = completedCount;
    this.uncompletedCount = uncompletedCount;
    this.user = user;
  }
}



export class Priority {
  id: number;
  title: string;
  color: string; // можно задавать цвет по-умолчанию
  user: User;

  constructor(id: number, title: string, color: string, user: User) {
    this.id = id;
    this.title = title;
    this.color = color;
    this.user = user;
  }


}



// общая статистика по всем задачам (по всем категориям)
export class Stat {
  id: number;
  title: string;
  completedTotal: number;
  uncompletedTotal: number;
}

export class Task {
  id: number;
  title: string;
  completed: number; // вместо boolean, чтобы удобный было записывать в БД
  priority: Priority;
  category: Category;
  taskDate?: Date;
  user: User; // чтобы знать, для какого пользователя добавляем задачу


  constructor(id: number, title: string, completed: number, priority: Priority, category: Category, user: User, taskDate?: Date) {
    this.id = id;
    this.title = title;
    this.completed = completed;
    this.priority = priority;
    this.category = category;
    this.taskDate = taskDate;
    this.user = user;
  }
}

