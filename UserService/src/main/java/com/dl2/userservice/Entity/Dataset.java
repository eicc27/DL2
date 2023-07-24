package com.dl2.userservice.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Data
@Table(name="dataset")
@AllArgsConstructor
@NoArgsConstructor
public class Dataset {
    @Id private String name;
    private String task;
    private Long user;
    @Column(name="intro", length = 10000)
    private String intro;
    private String path;
    private String test;
    private String metric;
    @Column
    @Temporal(TemporalType.DATE)
    private Date date;

    @PrePersist
    public void prePersist() {
        if (date == null)
            date = new Date(System.currentTimeMillis());
    }
}
