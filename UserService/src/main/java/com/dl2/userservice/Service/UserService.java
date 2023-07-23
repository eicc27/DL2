package com.dl2.userservice.Service;

import com.dl2.userservice.Entity.*;
import com.dl2.userservice.Repository.UserPaperRepository;
import com.dl2.userservice.Repository.PaperRepository;
import com.dl2.userservice.Repository.UserRepository;
import com.dl2.userservice.Repository.UserTaskRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository repo;

    @Autowired
    private UserPaperRepository userPaperRepository;

    @Autowired
    private UserTaskRepository userTaskRepository;

    @Autowired
    private PaperRepository paperRepository;


    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();


    @Transactional
    public Optional<User> checkByNameAndPwd(String name, String pwd) {
        Optional<User> user = repo.findUserByName(name);
        boolean result = user.map(u -> {
            return encoder.matches(pwd, u.getPassword());
        }).orElse(false);
        if (result) {
            return user;
        } else {
            return Optional.empty();
        }
    }

    @Transactional
    public boolean checkByName(String name) {
        Optional<User> user = repo.findUserByName(name);
        return user.isPresent();
    }

    @Transactional
    public Optional<User> getUserByName(String name) {
        return repo.findUserByName(name);
    }

    @Transactional
    public void register(User user) {
        user.setPassword(encoder.encode(user.getPassword()));
        repo.save(user);
    }

    @Transactional
    public boolean checkByEmail(String email) {
        Optional<User> user = repo.findUserByEmail(email);
        return user.isPresent();
    }

    @Transactional
    public void addUserFavorite(Long userId, String paperId) {
        userPaperRepository.addFavUserPaperByUserIdAndPaperId(userId, paperId);
    }

    @Transactional
    public void deleteUserFavorite(Long userId, String paperId) {
        userPaperRepository.deleteFavUserPaperByUserIdAndPaperId(userId, paperId);
    }

    @Transactional
    public void recordUserViewed(Long userId, String paperId) {
        // first delete
        List<UserPaper> userPapers = userPaperRepository.getRecentViewedPapersByUserId(userId);
        // then add
        // if exists, delete then insert
        List<UserPaper> papers = userPaperRepository.getUserPapersByUserIdAndPaperIdAndRating(userId, paperId, 1L);
        if (!papers.isEmpty()) {
            userPaperRepository.deleteViewedUserPaperById(papers.get(0).getId());
        }
        userPaperRepository.addViewedUserPaperByUserIdAndPaperId(userId, paperId);
    }

    @Transactional
    public boolean getUserFavourite(Long userId, String paperId) {
        List<UserPaper> papers = userPaperRepository.getUserPapersByUserIdAndPaperIdAndRating(userId, paperId, 2L);
        return !papers.isEmpty();
    }

    @Transactional
    public List<UserPaper> getUserRecentViewed(Long userId) {
        return userPaperRepository.getRecentViewedPapersByUserId(userId);
    }

    @Transactional
    public List<UserTask> getUserTasks(Long userId) {
        return userTaskRepository.getUserTaskByUserId(userId);
    }

    @Transactional
    public List<Paper> getUserNewPapers(Long userId) {
        return paperRepository.getNewPapersByUserId(userId);
    }

    @Transactional
    public List<UserPaper> getUserRecentFav(Long userId) {
        return userPaperRepository.getRecentFavPapersByUserId(userId);
    }

    @Transactional
    public void recordUserLikedTasks(Long userId, List<String> taskIds) {
        userTaskRepository.deleteAllLikedTaskByUserId(userId);
        for (String taskId : taskIds) {
            userTaskRepository.addLikedTaskByUserIdAndTaskId(userId, taskId);
        }
    }
}
