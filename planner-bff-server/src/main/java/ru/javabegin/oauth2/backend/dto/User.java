package ru.javabegin.oauth2.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter

// полные данные профиля пользователя, которые получаем из сервера авторизации (keycloak)
// можно добавлять и любые другие поля, в соответствии с бизнес процессами
// для нашего функционала хватает и этих полей
// пригодится для отображения в frontend
public class User {

    private String id;
    private String username;
    private String email;

    // можно добавлять любые поля, которые вам необходимы (из keycloak или другого Auth Server)

}
