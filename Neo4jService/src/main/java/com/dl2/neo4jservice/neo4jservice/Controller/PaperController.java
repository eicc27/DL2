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

    @GetMapping("/relatedPapers")
    @ResponseBody
    @CrossOrigin(originPatterns = "*", allowedHeaders = "*", allowCredentials = "true")
    public Response getRelatedPapers(@RequestParam("id") String paperId) {
        var papers = paperService.findNearbyPaper(paperId);
        return new Response(200, "Success", papers);
    }

    @PutMapping("/papers")
    @ResponseBody
    @CrossOrigin(originPatterns = "*", allowedHeaders = "*", allowCredentials = "true")
    public Response addPapers(@RequestBody PaperInsertionRequest request) {
        var papers = request.getPapers();
        var methods = request.getMethods();
        var tasks = request.getTasks();
        System.out.println("Adding papers");
        paperService.addPapers(papers, methods, tasks);
        System.out.println("Adding relations");
        paperService.addRelations(papers, methods, tasks);
//        System.out.println("Adding embeddings");
//        paperService.addEmbeddings(papers);
        return new Response(200, "Success");
    }

    @GetMapping("/homepage")
    @ResponseBody
    @CrossOrigin(originPatterns = "*", allowedHeaders = "*", allowCredentials = "true")
    public Response getHomepageGraph() {
        return new Response(200, "Success", paperService.getHomepageGraph());
    }
}
