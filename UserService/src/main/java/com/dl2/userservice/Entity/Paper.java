package com.dl2.userservice.Entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.Year;

@Data
@Entity
public class Paper {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "arxiv_id")
    private String arxivId;

    private String title;

    private Year author;

    @Column(name="abstract", length = 10000)
    private String abs;

    private Long citations;
}
