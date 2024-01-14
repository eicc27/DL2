package com.dl2.neo4jservice.neo4jservice.Controller;

import com.dl2.neo4jservice.neo4jservice.DTO.PaperInsertionRequest.PaperInsertionRequest;
import com.dl2.neo4jservice.neo4jservice.DTO.PaperRequest;
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

//    @PostMapping("/nearbyPaper")
//    @ResponseBody
//    @CrossOrigin(originPatterns = "*", allowedHeaders = "*", allowCredentials = "true")
//    public Response getPaperById(@RequestBody PaperRequest paperIds) {
//        PaperResponse paperResponse = paperService.findNearbyPaper(paperIds.getArxivId());
//        if (paperResponse == null) {
//            return new Response(400, "Paper not found.");
//        } else {
//            System.out.println(paperResponse);
//
//            return new Response(200, "Success.", paperResponse);
//        }
//    }

    @PutMapping("/papers")
    @ResponseBody
    @CrossOrigin(originPatterns = "*", allowedHeaders = "*", allowCredentials = "true")
    public Response addPapers(@RequestBody PaperInsertionRequest request) {
        var papers = request.getPapers();
        var methods = request.getMethods();
        var tasks = request.getTasks();
        paperService.addPapers(papers, methods, tasks);
        paperService.addRelations(papers, methods, tasks);
        return new Response(200, "Success");
    }
}
