package com.dl2.userservice.Controller;

import com.dl2.userservice.DTO.TaskPagedResponse;
import com.dl2.userservice.DTO.TaskResponse;
import com.dl2.userservice.Response;
import com.dl2.userservice.Service.MethodService;
import com.dl2.userservice.Service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@Controller
public class TaskAndMethodController {
    @Autowired
    private TaskService taskService;

    @Autowired
    private MethodService methodService;


    @GetMapping("/tasks")
    @ResponseBody
    @CrossOrigin
    public Response getTasks(
            @RequestParam(name = "page", required = false, defaultValue = "1") int page,
            @RequestParam(name = "num", required = false, defaultValue = "10") int num) {
        if (page < 0) {
            page = 0;
        }
        List<TaskResponse> taskResponses = this.taskService.getTasks(page, num);
        return new Response(200,
                "Success.",
                new TaskPagedResponse(taskResponses, this.taskService.countAll()));
    }

    @GetMapping("/methods")
    @ResponseBody
    @CrossOrigin
    public Response getMethods(
            @RequestParam(name = "page", required = false, defaultValue = "1") int page,
            @RequestParam(name = "num", required = false, defaultValue = "10") int num) {
        if (page < 0) {
            page = 0;
        }
        List<TaskResponse> taskResponses = this.methodService.getMethods(page, num);
        return new Response(200,
                "Success.",
                new TaskPagedResponse(taskResponses, this.methodService.countAll()));
    }

    @GetMapping("/task")
    @ResponseBody
    @CrossOrigin
    public Response getTask(
            @RequestParam(name = "taskName") String taskName) {
        return new Response(200,
                "Success.",
                this.taskService.getTask(taskName));
    }

    @GetMapping("/method")
    @ResponseBody
    @CrossOrigin
    public Response getMethod(
            @RequestParam(name = "methodName") String taskName) {
        return new Response(200,
                "Success.",
                this.methodService.getMethod(taskName));
    }

}
