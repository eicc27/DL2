package com.dl2.userservice.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "method")
public class Method {

    @Id
    private String name;

    @Column(length = 10000)
    private String intro;

    @Column(name = "paperid")
    private String paperid;
}
