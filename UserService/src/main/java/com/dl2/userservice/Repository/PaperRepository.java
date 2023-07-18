package com.dl2.userservice.Repository;

import com.dl2.userservice.Entity.Paper;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaperRepository extends JpaRepository<Paper, String> {

    Optional<Paper> getPaperByArxivId(String arxivId);
}
