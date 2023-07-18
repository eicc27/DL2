package com.dl2.userservice.Repository;


import com.dl2.userservice.Entity.Method;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MethodRepository extends JpaRepository<Method, String> {

    Optional<Method> getMethodByName(String name);

}
