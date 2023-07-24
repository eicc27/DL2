package com.dl2.userservice.Repository;

import com.dl2.userservice.Entity.Upload;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UploadRepository extends JpaRepository<Upload, Long> {
    List<Upload> getUploadsByDatasetOrderByScoreDesc(String dataset);

    @Query(value = """
                        (SELECT *\s
            FROM upload up
            JOIN user u ON u.id = up.user
            WHERE u.name != :name and dataset = :dataset
            ORDER BY score DESC\s
            LIMIT 25)

            UNION ALL

            (SELECT *\s
            FROM upload up
            JOIN user u ON u.id = up.user
            WHERE u.name = :name and dataset = :dataset
            ORDER BY score DESC\s
            LIMIT 5)

            ORDER BY score DESC;
            """, nativeQuery = true)
    List<Object[]> getUserUploadsAndTopUploads(String dataset, String name);

}
