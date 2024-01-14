package com.dl2.userservice.Entity;

import jakarta.persistence.*;
import lombok.Data;

import java.io.Serializable;

@Entity
@Table(name = "author_paper")
@IdClass(AuthorPaperId.class)
@Data
public class AuthorPaper {
    @Id
    @Column(name = "authorid")
    private String authorId;
    @Id
    @Column(name = "paperid")
    private String paperId;
}
