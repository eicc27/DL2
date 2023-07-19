package com.dl2.userservice.Controller;

import com.dl2.userservice.DTO.PaperResponse;
import com.dl2.userservice.Response;
import com.dl2.userservice.Service.PaperService;
import io.weaviate.client.Config;
import io.weaviate.client.WeaviateAuthClient;
import io.weaviate.client.WeaviateClient;
import io.weaviate.client.base.Result;
import io.weaviate.client.v1.auth.exception.AuthException;
import io.weaviate.client.v1.graphql.model.GraphQLResponse;
import io.weaviate.client.v1.graphql.query.argument.NearTextArgument;
import io.weaviate.client.v1.graphql.query.fields.Field;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/search")
public class SearchController {
    @Autowired
    private PaperService paperService;

    @GetMapping("/paper")
    @ResponseBody
    @CrossOrigin
    public Response genericSearch(@RequestParam("query") String query) throws AuthException {
        Config config = new Config("https", "dl2-6ld8p0k2.weaviate.network");
        WeaviateClient client = WeaviateAuthClient.apiKey(config, "ugyXUyDB0ODDjlivf1URI9lQBCQEc1t8orke");
        String className = "Abstract";
        Field id = Field.builder().name("arxiv_id").build();
        Field title = Field.builder().name("title").build();
        Field _additional = Field.builder()
                .name("_additional")
                .fields(new Field[]{
                        Field.builder().name("distance").build()
                }).build();
        String[] args = {query};
        NearTextArgument nearText = client.graphQL().arguments().nearTextArgBuilder().concepts(args).build();
        Result<GraphQLResponse> result = client.graphQL().get()
                .withClassName(className)
                .withFields(id, title, _additional)
                .withNearText(nearText)
                .withLimit(20)
                .run();
        if (result.getResult() == null) {
            List<PaperResponse> paperResponses = paperService.searchByTitle(query);
            return new Response(200, "Success.", paperResponses);
        }
        Map<String, Object> data = (Map<String, Object>) result.getResult().getData();
        List<Map<String, Object>> abstractData = (List<Map<String, Object>>) ((Map<String, Object>) data.get("Get")).get("Abstract");
        if (abstractData == null) {
            List<PaperResponse> paperResponses = paperService.searchByTitle(query);
            return new Response(200, "Success.", paperResponses);
        }
        List<String> arxivIds = new ArrayList<>();
        for (Map<String, Object> entry : abstractData) {
            arxivIds.add((String) entry.get("arxiv_id"));
        }
        List<PaperResponse> paperResponses = new ArrayList<>();
        for (String arxivId : arxivIds) {
            PaperResponse paperResponse = paperService.getPaperByArxivId(arxivId);
            paperResponses.add(paperResponse);
        }
        return new Response(200, "Success.", paperResponses);
    }
}
