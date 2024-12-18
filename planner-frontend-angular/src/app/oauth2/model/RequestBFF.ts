/*
Объекты для запросов в BFF.
Все поля должны совпадать один в один с POJO из backend, чтобы автоматическая конвертация JSON работала корректно.
Последовательности и типы полей - должны совпадать.
 */

// какую операцию должен выполнить BFF
export class Operation {
  httpMethod: HttpMethod; // тип метода для вызова
  url: string; // какой адрес BFF будет вызывать у Resource Server
  body: any; // вложения запроса (конвертируется автоматически в JSON)
}



/*
Используется для того, чтобы указать BFF какой тип методы вызывать в Resource Server
скопировал значения из класса Java, чтобы точно совпадали названия

public enum HttpMethod {

    GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS, TRACE;

 */

export enum HttpMethod {
  GET,
  HEAD,
  POST,
  PUT,
  PATCH,
  DELETE,
  OPTIONS,
  TRACE,
  HttpMethod
}
