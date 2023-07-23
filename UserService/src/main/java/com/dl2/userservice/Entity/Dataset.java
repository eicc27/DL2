package com.dl2.userservice.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
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
    private Date date;
}
