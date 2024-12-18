package ru.javabegin.micro.planner.entity;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.util.Objects;

/*

общая статистика по задачам (незвисимо от категорий задач)

 */

@Entity
@Table(name = "stat", schema = "todo", catalog = "planner_todo")
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class Stat { // в этой таблице всего 1 запись, которая обновляется (но никогда не удаляется)

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "completed_total", updatable = false)
    private Long completedTotal; // значение задается в триггере в БД

    @Column(name = "uncompleted_total", updatable = false)
    private Long uncompletedTotal; // значение задается в триггере в БД

//    @Column(name = "email", insertable = false, updatable = false)
//    private String email;

//    @OneToOne(fetch = FetchType.LAZY)
//    @JsonProperty(access = JsonProperty.Access.READ_WRITE)
//    @MapsId
//    @JoinColumn(name = "email", referencedColumnName = "email") // по каким полям связывать (foreign key)
//    private User user;

    @Column
    private String email;



    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Stat stat = (Stat) o;
        return id.equals(stat.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
