package com.dl2.userservice.Entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.sql.Date;

@Entity
@Data
@Table(name="upload")
public class Upload {
    @Id
    private String name;
    private Date date;
    private Float score;
    private Long user;
    private String dataset;
}
