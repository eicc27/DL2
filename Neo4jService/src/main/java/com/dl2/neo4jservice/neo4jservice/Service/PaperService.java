package com.dl2.neo4jservice.neo4jservice.Service;

import com.dl2.neo4jservice.neo4jservice.DTO.CitationResult;
import com.dl2.neo4jservice.neo4jservice.DTO.PaperInsertionRequest.Method;
import com.dl2.neo4jservice.neo4jservice.DTO.PaperInsertionRequest.PaperRequest;
import com.dl2.neo4jservice.neo4jservice.DTO.PaperInsertionRequest.Task;
import com.dl2.neo4jservice.neo4jservice.DTO.PaperResponse;
import com.dl2.neo4jservice.neo4jservice.Entity.Paper;
import com.dl2.neo4jservice.neo4jservice.Repository.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.util.Pair;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class PaperService {
    @Autowired
    private PaperRepository paperRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private CodeRepository codeRepository;

    @Autowired
    private MethodRepository methodRepository;

    @Autowired
    private AuthorRepository authorRepository;

//    @Transactional
//    public PaperResponse findNearbyPaper(List<String> paperIds) {
//
//    }

////    @Transactional
//    public PaperResponse findNearbyPaper(List<String> paperIds) {
//        List<Paper> NearbyPapers = paperRepository.findNearbyPapers(paperIds);
//        if (NearbyPapers == null) {
//            // 处理找不到给定ID的论文的情况
//            return null;
//        }
//        String[] nearbyPaperIds = new String[NearbyPapers.size()];
//        Long[] nearbyPaperCitations = new Long[NearbyPapers.size()];
//        for(Paper p : NearbyPapers) {
//            nearbyPaperIds[NearbyPapers.indexOf(p)] = p.getPaperId();
//            nearbyPaperCitations[NearbyPapers.indexOf(p)] = p.getCitedNum();
//        }
//        return new PaperResponse(nearbyPaperIds, nearbyPaperCitations);
//    }

    @Transactional
    public List<String> findNearbyPaper(String paperId) {
        return paperRepository.getNearbyPapers(paperId);
    }

    @Transactional
    public void addPapers(PaperRequest[] papers, Method[] methods, Task[] tasks) {
        for (var paper : papers) {
            System.out.println("Adding paper: " + paper.getName());
            paperRepository.setPaper(paper.getId(),
                    paper.getName(),
                    paper.getAbs(),
                    paper.getCitations());
            for (var author : paper.getAuthors()) {
                authorRepository.setAuthor(author);
            }
            for (var code : paper.getCodes()) {
                codeRepository.setCode(code.getUrl(), code.getRating());
            }
        }
        for (var method : methods) {
            System.out.println("Adding method: " + method.getMethod());
            methodRepository.setMethod(method.getMethod(), method.getDesc());
        }
        for (var task : tasks) {
            System.out.println("Adding task: " + task.getName());
            taskRepository.setTask(task.getName(), task.getDesc());
        }
    }

    @Transactional
    public void addRelations(PaperRequest[] papers, Method[] methods, Task[] tasks) {
        for (var paper : papers) {
            var paperMethods = Arrays.stream(paper.getMethods())
                    .flatMap(m -> Arrays.stream(methods)
                            .filter(t -> Objects.equals(t.getId(), m)))
                    .toArray(Method[]::new);
            var paperTasks = Arrays.stream(paper.getTasks())
                    .flatMap(t -> Arrays.stream(tasks)
                            .filter(i -> Objects.equals(i.getId(), t)))
                    .toArray(Task[]::new);
            for (var p : paper.getReferencedPapers()) {
                System.out.println(paper.getId() + "-->" + p);
                paperRepository.setPaperCitation(paper.getId(), p);
            }
            for (var a : paper.getAuthors()) {
                System.out.println(a + "-->" + paper.getId());
                authorRepository.setAuthorPaper(a, paper.getId());
            }
            for (var m : paperMethods) {
                System.out.println(m.getMethod() + "-->" + m.getArxivId());
                methodRepository.setMethodPaper(paper.getId(), m.getMethod());
                if (!Objects.isNull(m.getArxivId()))
                    methodRepository.setPaperMethod(m.getMethod(), m.getArxivId());
            }
            for (var t : paperTasks) {
                System.out.println(paper.getId() + "-->" + t.getName());
                taskRepository.setTaskPaper(paper.getId(), t.getName());
            }
        }
    }

    @Transactional
    public void addEmbeddings(PaperRequest[] papers) {
        for (var paper : papers) {
            var vector = GenAIService.embedPaper(paper.getName(), paper.getAbs());
            paperRepository.setPaperEmbedding(paper.getId(), Arrays.toString(vector));
            System.out.println("Embedded: " + paper.getName());
        }
    }

    @Transactional
    public List<Map<String, String>> getHomepageGraph() {
        return paperRepository.getHomepageGraph();
    }
}
