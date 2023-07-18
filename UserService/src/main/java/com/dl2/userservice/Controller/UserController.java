package com.dl2.userservice.Controller;


import com.dl2.userservice.DTO.UserRequest;
import com.dl2.userservice.Entity.User;
import com.dl2.userservice.Response;
import com.dl2.userservice.Security.JWTUtil;
import com.dl2.userservice.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/user")
public class UserController {
    @Autowired
    private UserService service;

    private final JWTUtil jwtUtil = new JWTUtil();

    @PostMapping("/login")
    @ResponseBody
    @CrossOrigin
    public Response login(
            @RequestBody UserRequest dto
    ) {
        Optional<User> user = service.checkByNameAndPwd(dto.getName(), dto.getPassword());
        if (user.isPresent()) {
            String token = jwtUtil
                    .createToken(Map.of("name", user.get().getName(), "email", user.get().getEmail()));
            return new Response(200, "Login success", token);
        } else {
            return new Response(400, "Wrong user name or password");
        }
    }

    @PostMapping("/register")
    @ResponseBody
    @CrossOrigin
    public Response register(
            @RequestBody User user
    ) {
        if (service.checkByName(user.getName())) {
            return new Response(400, "User name duplicated.");
        } else if (service.checkByEmail(user.getEmail())) {
            return new Response(401, "Email duplicated.");
        } else {
            String token = jwtUtil
                    .createToken(Map.of("name", user.getName(), "email", user.getEmail()));
            service.register(user);
            return new Response(200, "Register success.", token);
        }
    }
}
