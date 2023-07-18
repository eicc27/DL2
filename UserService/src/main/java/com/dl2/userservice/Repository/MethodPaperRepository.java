package com.dl2.userservice.Repository;

import com.dl2.userservice.Entity.MethodPaper;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MethodPaperRepository extends JpaRepository<MethodPaper, String> {
    List<MethodPaper> getMethodPapersByPaperId(String paperId);

    Optional<MethodPaper> getMethodPaperByMethodId(String methodId);
}
