package com.dl2.userservice.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Date;

@Entity
@Data
@Table(name = "upload")
@AllArgsConstructor
@NoArgsConstructor
public class Upload {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String name;
    @Column
    @Temporal(TemporalType.DATE)
    private Date date;
    private Float score;
    private Long user;
    private String dataset;

    @PrePersist
    public void prePersist() {
        if (date == null)
            date = new Date(System.currentTimeMillis());
    }
}
