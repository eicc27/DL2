package com.dl2.userservice.Controller;


import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.security.Principal;

@Controller
@RequestMapping("/user")
public class UserController {
    @GetMapping("/hello")
    @ResponseBody
    public String hello() {
        return "hello world";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/home")
    public String home(Principal principal) {
        return "Welcome, " + principal.getName();
    }
}
