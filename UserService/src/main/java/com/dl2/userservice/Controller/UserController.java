package com.dl2.userservice.Controller;


import com.dl2.userservice.DTO.UserRequest;
import com.dl2.userservice.Entity.User;
import com.dl2.userservice.Response;
import com.dl2.userservice.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserController {
    @Autowired
    private UserService service;

    @PostMapping("/login")
    @ResponseBody
    @CrossOrigin
    public Response login(
            @RequestBody UserRequest dto
            ) {
        if (service.checkByNameAndPwd(dto.getName(), dto.getPassword())) {
            return new Response(200, "Login success", dto.getName());
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
        } else {
            service.register(user);
            return new Response(200);
        }
    }
}
