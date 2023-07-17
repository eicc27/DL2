package com.dl2.userservice.Service;

import com.dl2.userservice.Entity.User;
import com.dl2.userservice.Repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository repo;



    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();


    @Transactional
    public boolean checkByNameAndPwd(String name, String pwd) {
        Optional<User> user = repo.findUserByName(name);
        return user.map(u -> {
            return encoder.matches(pwd, u.getPassword());
        }).orElse(false);
    }

    @Transactional
    public boolean checkByName(String name) {
        Optional<User> user = repo.findUserByName(name);
        return user.isPresent();
    }

    @Transactional
    public User register(User user) {
        user.setPassword(encoder.encode(user.getPassword()));
        return repo.save(user);
    }
}
