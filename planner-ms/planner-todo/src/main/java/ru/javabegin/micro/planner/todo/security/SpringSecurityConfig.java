package ru.javabegin.micro.planner.todo.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.firewall.StrictHttpFirewall;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import ru.javabegin.micro.planner.utils.converter.KCRoleConverter;

import java.util.Arrays;

@Configuration // данный класс будет считан как конфиг для spring контейнера
@EnableWebSecurity // включает механизм защиты адресов, которые настраиваются в SecurityFilterChain
@EnableGlobalMethodSecurity(prePostEnabled = true) // включение механизма для защиты методов по ролям
public class SpringSecurityConfig {

    // в этом файле мы не настраиваем CORS, т.к. это настраивается на уровне Gateway

    // создается спец. бин, который отвечает за настройки запросов по http (метод вызывается автоматически) Spring контейнером
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        // конвертер для настройки spring security
        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        // подключаем конвертер ролей
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(new KCRoleConverter());


        // все сетевые настройки
        http.authorizeRequests()
                .antMatchers("/category/*", "/priority/*", "/task/*", "/stat/*").hasRole("user")
                .anyRequest().authenticated() // API будет доступен только аутентифицированным пользователям

                .and() // добавляем другие настройки

                .csrf().disable()// при использовании токенов, эта защита не нужна (уже используется в oauth2)
                .cors() // разрешает выполнять preflight запросы типа OPTIONS, чтобы у них не проверялись токены

                .and()// добавляем другие настройки

                .oauth2ResourceServer()// добавляем конвертер ролей из JWT в Authority (Role)
                .jwt()// обработчик-валидатор JWT (проверяет целостность, срок действия и пр.)
                .jwtAuthenticationConverter(jwtAuthenticationConverter);

        return http.build();
    }

    // чтобы не было отклонения запросов с недопустимыми значениями в заголовках
    @Bean
    public StrictHttpFirewall httpFirewall() {
        StrictHttpFirewall firewall = new StrictHttpFirewall();
        firewall.setAllowedHeaderNames((header) -> true);
        firewall.setAllowedHeaderValues((header) -> true); // не отклонять запросы с не ISO символами
        firewall.setAllowedParameterNames((parameter) -> true);
        return firewall;
    }


    @Value("${client.url}")
    private String clientURL; // клиентский URL

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(clientURL));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }


}
