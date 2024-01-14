package com.dl2.userservice.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "task")
public class Task {
    @Id
    private String name;

    @Column(length = 10000)
    private String intro;
}
