package com.dl2.userservice.Repository;

import com.dl2.userservice.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findUserByName(String name);

    Optional<User> findUserByEmail(String email);

    Optional<User> findUserByNameAndPassword(String name, String pwd);

    Optional<User> findUserById(Long id);
}

