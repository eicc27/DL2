package com.dl2.userservice.Repository;


import com.dl2.userservice.DTO.TaskMethodQuery;
import com.dl2.userservice.Entity.Method;
import lombok.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MethodRepository extends JpaRepository<Method, String> {

    Optional<Method> getMethodByName(String name);

    @Query(value = "SELECT COUNT(*) FROM method", nativeQuery = true)
    int getTotalMethods();

    @NonNull
    Page<Method> findAll(@NonNull Pageable pageable);

    @Query(value = """
            WITH method_counts AS
                ( SELECT t.name AS task_name,
                         m.name AS method_name,
                         COUNT(*) AS paper_count,
                         ROW_NUMBER() OVER(PARTITION BY t.name ORDER BY COUNT(*) DESC) AS rn
                            FROM task t
                            JOIN task_paper tp ON t.name = tp.taskid
                            JOIN method_paper mp ON tp.paperid = mp.paperid
                            JOIN method m ON mp.methodid = m.name
                            WHERE t.name = :task_name GROUP BY t.name, m.name )
                         SELECT task_name, method_name, paper_count
                         FROM method_counts
                         WHERE rn <= 5
                         ORDER BY paper_count DESC
                         LIMIT 5;
            """, nativeQuery = true)
    List<Object[]> getTopMethodsByTaskName(@Param("task_name") String taskName);

    @Query(value = """
    SELECT COUNT(*) as num, tp.methodid, t.intro
    from method_paper as tp
    join method t
    on t.name = tp.methodid
    group by methodid
    order by num desc
    limit :size
    offset :offset
    """, nativeQuery = true)
    List<Object[]> sortByNumPapers(int offset, int size);

    @Query(value= """
                select p.arxiv_id
                from method_paper as tp
                join paper p
                on p.arxiv_id = tp.paperid
                where tp.methodid=:task_name
                order by p.citations desc,
                p.year desc
                limit 5;
            """, nativeQuery = true)
    List<Object[]> getTopPapersByMethodName(@Param(value = "task_name") String methodName);


}
