package ru.javabegin.micro.planner.todo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.javabegin.micro.planner.todo.service.TestDataService;

// для заполнения тестовыми данными

@RestController
@RequestMapping("/data") // базовый URI

public class TestDataController {

    private final TestDataService testDataService;


    // используем автоматическое внедрение экземпляра класса через конструктор
    // не используем @Autowired ля переменной класса, т.к. "Field injection is not recommended "
    public TestDataController(TestDataService testDataService) {
        this.testDataService = testDataService;
    }



    @PostMapping("/init")
    public ResponseEntity<Boolean> init(@RequestBody String email) {

        testDataService.initTestData(email);

        // если пользователя НЕ существует
        return ResponseEntity.ok(true);

    }


}
