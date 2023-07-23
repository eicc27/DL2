package com.dl2.userservice.Repository;

import com.dl2.userservice.Entity.Dataset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DatasetRepository extends JpaRepository<Dataset, String> {
    Optional<Dataset> getDatasetByName(String name);

    @Query(value = """
            select * from dataset
            join (select count(*) as num, taskid from task_paper group by taskid) as t
            on t.taskid = dataset.task
            order by t.num desc
            limit 10;
            """, nativeQuery = true)
    List<Object[]> getTrendingDatasets();

}
