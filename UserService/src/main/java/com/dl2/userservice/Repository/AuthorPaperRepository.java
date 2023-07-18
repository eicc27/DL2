package com.dl2.userservice.Repository;

import com.dl2.userservice.Entity.AuthorPaper;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuthorPaperRepository extends JpaRepository<AuthorPaper, String> {

    Optional<AuthorPaper> getAuthorPaperByAuthorId(String authorId);

    List<AuthorPaper> getAuthorPapersByPaperId(String paperId);
}
