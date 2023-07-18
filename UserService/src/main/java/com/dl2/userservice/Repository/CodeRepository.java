package com.dl2.userservice.Repository;

import com.dl2.userservice.Entity.Code;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CodeRepository extends JpaRepository<Code, Long> {
    List<Code> getCodesByPaperId(String paperId);
}
