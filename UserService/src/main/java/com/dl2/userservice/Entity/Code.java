package com.dl2.userservice.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "code")
public class Code {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String url;

    private Long rating;

    @Column(name = "paperid")
    private String paperId;
}
