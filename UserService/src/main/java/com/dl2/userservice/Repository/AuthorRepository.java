package com.dl2.userservice.Repository;

import com.dl2.userservice.Entity.Author;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AuthorRepository extends JpaRepository<Author, String> {
    Optional<Author> getAuthorByName(String name);
}
