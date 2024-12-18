package ru.javabegin.micro.planner.todo.mq.legacy;

import org.springframework.stereotype.Component;


/*

!! нельзя в одном проекте исползовать и @EnableBinding и функциональный код для message broker - иначе не будет работать

 */

//@EnableBinding(TodoBinding.class)
@Component
public class MessageConsumer {

//    private TestDataService testDataService;
//
//    private MessageConsumer(TestDataService testDataService){
//        this.testDataService = testDataService;
//    }
//
//    // метод вызывается автометически как только появляется сообщение в канале
//    @StreamListener(target = TodoBinding.INPUT_CHANNEL)
//    public void initTestData(Long userId) throws Exception {
////        throw new Exception("test dlq");
//        testDataService.initTestData(userId);
//    }
}
