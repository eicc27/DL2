package com.dl2.userservice.Repository;

import com.dl2.userservice.Entity.UserPaper;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserPaperRepository extends JpaRepository<UserPaper, Long> {
    List<UserPaper> getUserPapersByUserIdAndPaperIdAndRating(Long userId, String paperId, Long rating);

    @Transactional
    @Modifying
    @Query(value = """
            delete from user_paper
            where userid = :userId and paperid = :paperId and rating = 2;
            """, nativeQuery = true)
    void deleteFavUserPaperByUserIdAndPaperId(Long userId, String paperId);

    @Transactional
    @Modifying
    @Query(value = """
            insert into user_paper (userid, paperid, rating)
            values (:userId, :paperId, 2);
            """, nativeQuery = true)
    void addFavUserPaperByUserIdAndPaperId(Long userId, String paperId);


    @Transactional
    @Modifying
    @Query(value = """
            insert into user_paper (userid, paperid, rating)
            values (:userId, :paperId, 1);
            """, nativeQuery = true)
    void addViewedUserPaperByUserIdAndPaperId(Long userId, String paperId);

    @Query(value = """
            select * from user_paper
            where userid = :userId and rating = 1
            order by id desc limit 5;
            """, nativeQuery = true)
    List<UserPaper> getRecentViewedPapersByUserId(Long userId);

    @Query(value = """
            select * from user_paper
            where userid = :userId and rating = 2
            order by id desc limit 5;
            """, nativeQuery = true)
    List<UserPaper> getRecentFavPapersByUserId(Long userId);

    @Transactional
    @Modifying
    @Query(value = """
            delete from user_paper
            where `id` = ?;
            """, nativeQuery = true)
    void deleteViewedUserPaperById(Long id);
}
