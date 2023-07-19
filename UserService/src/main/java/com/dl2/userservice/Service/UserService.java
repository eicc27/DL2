package com.dl2.userservice.Service;

import com.dl2.userservice.Entity.User;
import com.dl2.userservice.Entity.UserPaper;
import com.dl2.userservice.Repository.UserPaperRepository;
import com.dl2.userservice.Repository.UserRepository;
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
    public boolean isUserFavourite(Long userId, String paperid) {
        List<UserPaper> userPapers = userPaperRepository.getUserPapersByUserIdAndPaperIdAndRating(userId, paperid, 2L);
        if (userPapers.isEmpty()) {
            return false;
        } else {
            boolean flag = false;
            for (UserPaper userPaper : userPapers) {
                if (userPaper.getRating() == 2) {
                    flag = true;
                    break;
                }
            }
            return flag;
        }
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
        if (userPapers.size() >= 5) {
            userPaperRepository.deleteViewedUserPaperById(userPapers.get(4).getId());
        }
        // then add
        userPaperRepository.addViewedUserPaperByUserIdAndPaperId(userId, paperId);
    }

    @Transactional
    public boolean getUserFavourite(Long userId, String paperId) {
        List<UserPaper> papers = userPaperRepository.getUserPapersByUserIdAndPaperIdAndRating(userId, paperId, 2L);
        return !papers.isEmpty();
    }
}
