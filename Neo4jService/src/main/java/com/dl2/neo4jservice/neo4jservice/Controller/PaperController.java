package com.dl2.neo4jservice.neo4jservice.Controller;

import com.dl2.neo4jservice.neo4jservice.DTO.PaperResponse;
import com.dl2.neo4jservice.neo4jservice.Response;
import com.dl2.neo4jservice.neo4jservice.Service.PaperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/paper")
public class PaperController {

    @Autowired
    private PaperService paperService;

    @PostMapping("/nearbyPaper")
    @ResponseBody
    @CrossOrigin(originPatterns = "*", allowedHeaders = "*", allowCredentials = "true")
    public Response getPaperById(@RequestBody List<String> paperIds) {
        PaperResponse paperResponse = paperService.findNearbyPaper(paperIds);
        if (paperResponse == null) {
            return new Response(400, "Paper not found.");
        } else {
            System.out.println(paperResponse);

            return new Response(200, "Success.", paperResponse);
        }
    }

}
