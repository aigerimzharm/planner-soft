/*
Объекты для поиска данных пользователя.
Все поля должны совпадать один в один с POJO из backend, чтобы автоматическая конвертация JSON работала корректно.
Последовательности и типы полей - должны совпадать.
 */


// параметры поиска категорий (заполняться могут не все)
export class CategorySearchValues {
    title: string = null;
    email: string = null; // фильтрация для конкретного пользователя
}

// параметры поиска приоритетов (заполняться могут не все)
export class PrioritySearchValues {
    title: string = null;
    email: string = null; // фильтрация для конкретного пользователя
}

// параметры поиска категорий (заполняться могут не все)
export class TaskSearchValues {

    // начальные значения по-умолчанию (задаем null, чтобы не было значение undefined)
    title = '';
    completed: number = null; // 0 = true, 1 = false
    priorityId: number = null;
    categoryId: number = null;

    dateFrom: Date = null; // только дата, без времени
    dateTo: Date = null;

    // обязательные поля
    email: string = null; // фильтрация для конкретного пользователя
    pageNumber = 0; // 1-я страница (значение по-умолчанию)
    pageSize = 5; // сколько элементов на странице (значение по-умолчанию)

    // сортировка
    sortColumn = 'title';
    sortDirection = 'asc';

}
