export const environment = {
  production: true,
  resourceServerURL: 'https://angular-todo-resource.herokuapp.com', // ссылка на корневой URL бэкенда
  frontendURL: 'https://angular-todo-bff.herokuapp.com', // ссылка на корневой URL фронтэнда
  kcClientID: 'todoapp-client', // из настроек KeyCloak
  kcBaseURL: 'https://keycloak-instance-todo.herokuapp.com/auth/realms/todoapp-realm/protocol/openid-connect', // базовый URL KeyCloak
  bffURI: 'https://angular-todo-bff.herokuapp.com',
  redirectURI: 'https://angular-todo-bff.herokuapp.com'
};
