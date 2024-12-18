package ru.javabegin.micro.planner.todo.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import ru.javabegin.micro.planner.entity.User;

@FeignClient(name = "planner-users", fallback = UserFeignClientFallback.class)
public interface UserFeignClient {

    @PostMapping("/user/id")
    ResponseEntity<User> findUserById(@RequestBody Long id);
}

@Component
class UserFeignClientFallback implements UserFeignClient {

    // этот метод будет вызываться, если сервис /user/id не будет доступен
    @Override
    public ResponseEntity<User> findUserById(Long id) {
        return null;
    }
}

