package com.dl2.userservice.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "user_paper")
public class UserPaper {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    @Column(name = "userid")
    private Long userId;
    @Column(name = "paperid")
    private String paperId;
    @Column(name = "rating")
    private Integer rating;
}
