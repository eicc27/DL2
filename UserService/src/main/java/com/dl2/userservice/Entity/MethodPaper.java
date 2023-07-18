package com.dl2.userservice.Entity;

import jakarta.persistence.*;
import lombok.Data;

import java.io.Serializable;

@Data
@Entity
@IdClass(MethodPaperId.class)
@Table(name = "method_paper")
public class MethodPaper {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "methodid")
    private String methodId;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "paperid")
    private String paperId;
}
