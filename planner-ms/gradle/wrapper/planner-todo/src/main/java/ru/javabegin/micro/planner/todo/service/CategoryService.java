package ru.javabegin.micro.planner.todo.service;

import org.springframework.stereotype.Service;
import ru.javabegin.micro.planner.entity.Category;
import ru.javabegin.micro.planner.todo.repo.CategoryRepository;

import javax.transaction.Transactional;
import java.util.List;


// всегда нужно создавать отдельный класс Service для доступа к данным, даже если кажется,
// что мало методов или это все можно реализовать сразу в контроллере
// Такой подход полезен для будущих доработок и правильной архитектуры (особенно, если работаете с транзакциями)
@Service

// все методы класса должны выполниться без ошибки, чтобы транзакция завершилась
// если в методе выполняются несолько SQL запросов и возникнет исключение - то все выполненные операции откатятся (Rollback)
@Transactional
public class CategoryService {

    // работает встроенный механизм DI из Spring, который при старте приложения подставит в эту переменную нужные класс-реализацию
    private final CategoryRepository repository; // сервис имеет право обращаться к репозиторию (БД)

    public CategoryService(CategoryRepository repository) {
        this.repository = repository;
    }

    public List<Category> findAll(String email) {
        return repository.findByEmailOrderByTitleAsc(email);
    }


    public Category add(Category category) {
        return repository.save(category); // метод save обновляет или создает новый объект, если его не было
    }

    public Category update(Category category) {
        return repository.save(category); // метод save обновляет или создает новый объект, если его не было
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }

    // поиск категорий пользователя по названию
    public List<Category> findByTitle(String title, String email) {
        return repository.findByTitle(title, email);
    }

    // поиск категории по ID
    public Category findById(Long id) {
        return repository.findById(id).get(); // т.к. возвращается Optional - можно получить объект методом get()
    }



}
