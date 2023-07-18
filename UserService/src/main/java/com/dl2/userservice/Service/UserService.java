package com.dl2.userservice.Service;

import com.dl2.userservice.Entity.User;
import com.dl2.userservice.Repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import javax.swing.text.html.Option;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository repo;


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
    public void register(User user) {
        user.setPassword(encoder.encode(user.getPassword()));
        repo.save(user);
    }

    @Transactional
    public boolean checkByEmail(String email) {
        Optional<User> user = repo.findUserByEmail(email);
        return user.isPresent();
    }
}
