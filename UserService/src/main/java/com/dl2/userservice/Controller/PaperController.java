package com.dl2.userservice.Controller;

import com.dl2.userservice.DTO.PaperResponse;
import com.dl2.userservice.DTO.PapersRequest;
import com.dl2.userservice.Response;
import com.dl2.userservice.Service.PaperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

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

    @GetMapping("/{paperId}/popularTask")
    @ResponseBody
    @CrossOrigin
    public Response getPopularTask(@PathVariable("paperId") String paperId) {
//        return new Response(200, "here is the popular task");
        return new Response(200, "Success.", paperService.getMostPopularTasksByNumOfPapers(paperId));
    }

    @GetMapping("/{paperId}/popularMethod")
    @ResponseBody
    @CrossOrigin
    public Response getPopularMethod(@PathVariable("paperId") String paperId) {
        return new Response(200, "Success.", paperService.getMostPopularMethodsByNumOfPapers(paperId));
    }

    @GetMapping("/featured/papers")
    @ResponseBody
    @CrossOrigin
    public Response getFeaturedPapers() {
        return new Response(200, "Success.", paperService.getMostCitedPapers());
    }

    @GetMapping("/featured/tasks")
    @ResponseBody
    @CrossOrigin
    public Response getFeaturedTasks() {
        return new Response(200, "Success.", paperService.getFeaturedTasks());
    }

    @GetMapping("/featured/methods")
    @ResponseBody
    @CrossOrigin
    public Response getFeaturedMethods() {
        return new Response(200, "Success.", paperService.getFeaturedMethods());
    }

    @PostMapping("/papers")
    @ResponseBody
    @CrossOrigin
    public Response getPapers(@RequestBody PapersRequest paperIds) {
        List<PaperResponse> paperResponses = new ArrayList<>();
        for (String paperId : paperIds.getArxivId()) {
            PaperResponse paperResponse = paperService.getPaperByArxivId(paperId);
            if (paperResponse != null) {
                paperResponses.add(paperResponse);
            }
        }
        return new Response(200, "Success.", paperResponses);
    }
}
