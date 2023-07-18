package com.dl2.userservice.Controller;

import com.dl2.userservice.DTO.PaperResponse;
import com.dl2.userservice.Response;
import com.dl2.userservice.Service.PaperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/paper")
public class PaperController {

    @Autowired
    private PaperService paperService;

    @GetMapping("/{paperId}")
    @ResponseBody
    @CrossOrigin
    public Response getPaperById(@PathVariable("paperId") String paperId) {
        PaperResponse paperResponse = paperService.getPaperByArxivId(paperId);
        if (paperResponse == null) {
            return new Response(400, "Paper not found.");
        } else {
            return new Response(200, "Success.", paperResponse);
        }
    }
}
