package com.dl2.userservice.Repository;

import com.dl2.userservice.Entity.MethodPaper;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MethodPaperRepository extends JpaRepository<MethodPaper, String> {
    List<MethodPaper> getMethodPapersByPaperId(String paperId);

    Optional<MethodPaper> getMethodPaperByMethodId(String methodId);

    @Query(value = """
                    select methodid, num
                    from method_paper,
                    (
                    	select methodid, count(*) as num
                        from method_paper
                        group by methodid
                        order by num desc
                    ) as Order_method(id, num)
                    where paperid = :paperId and id = methodid
                    limit 5;
                   """, nativeQuery = true)
    List<Object[]> getMostPopularMethodsByNumOfPapers(@Param("paperId") String paperId);
}
