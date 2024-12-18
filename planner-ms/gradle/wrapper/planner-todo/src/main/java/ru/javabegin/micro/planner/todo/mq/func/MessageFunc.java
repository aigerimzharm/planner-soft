package ru.javabegin.micro.planner.todo.mq.func;

//@Configuration // spring считывает бины и создает соотв. каналы
// описываются все каналы с помощью функциональных методов
// этот способ - рекомендуемый, вместо старого способа (@Binding, интерфейсы)
public class MessageFunc {

//    // для заполнения тестовых данных
//    private TestDataService testDataService;
//
//    public MessageFunc(TestDataService testDataService) {
//        this.testDataService = testDataService;
//    }
//
//    // получает id пользователя и запускает создание тестовых данных
//    // название метода должно совпадать с настройками definition и bindings в файлах properties (или yml)
//    @Bean
//    public Consumer<Message<String>> newUserActionConsume() {
//        return message -> testDataService.initTestData(message.getPayload());
//    }


}



