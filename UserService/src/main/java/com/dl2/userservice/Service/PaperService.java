package com.dl2.userservice.Service;

import com.dl2.userservice.DTO.*;
import com.dl2.userservice.Entity.*;
import com.dl2.userservice.Repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PaperService {
    @Autowired
    private PaperRepository paperRepository;

    @Autowired
    private MethodPaperRepository methodPaperRepository;

    @Autowired
    private MethodRepository methodRepository;

    @Autowired
    private AuthorPaperRepository authorPaperRepository;

    @Autowired
    private AuthorRepository authorRepository;

    @Autowired
    private TaskPaperRepository taskPaperRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private CodeRepository codeRepository;

    @Transactional
    public PaperResponse getPaperByArxivId(String arxivId) {
        Optional<Paper> paper = paperRepository.getPaperByArxivId(arxivId);
        if (paper.isEmpty()) {
            return null;
        }
        List<MethodPaper> methodPapers = methodPaperRepository.getMethodPapersByPaperId(arxivId);
        TaskAndMethodResponse[] methods = new TaskAndMethodResponse[methodPapers.size()];
        for (MethodPaper methodPaper : methodPapers) {
            Optional<Method> method = methodRepository.getMethodByName(methodPaper.getMethodId());
            method.ifPresent(value -> methods[methodPapers.indexOf(methodPaper)] = new TaskAndMethodResponse(value.getName(), value.getIntro()));
        }
        List<TaskPaper> taskPapers = taskPaperRepository.getTaskPapersByPaperId(arxivId);
        TaskAndMethodResponse[] tasks = new TaskAndMethodResponse[taskPapers.size()];
        for (TaskPaper taskPaper : taskPapers) {
            Optional<Task> task = taskRepository.getTaskByName(taskPaper.getTaskId());
            task.ifPresent(value -> tasks[taskPapers.indexOf(taskPaper)] = new TaskAndMethodResponse(value.getName(), value.getIntro()));
        }
        List<AuthorPaper> authorPapers = authorPaperRepository.getAuthorPapersByPaperId(arxivId);
        String[] authors = new String[authorPapers.size()];
        for (AuthorPaper authorPaper : authorPapers) {
            Optional<Author> author = authorRepository.getAuthorByName(authorPaper.getAuthorId());
            author.ifPresent(value -> authors[authorPapers.indexOf(authorPaper)] = value.getName());
        }
        List<Code> codes = codeRepository.getCodesByPaperId(arxivId);
        CodeResponse[] codeResponses = new CodeResponse[codes.size()];
        for (Code code : codes) {
            codeResponses[codes.indexOf(code)] = new CodeResponse(code.getUrl(), code.getRating());
        }
        return new PaperResponse(paper.get().getArxivId(),
                paper.get().getTitle(),
                paper.get().getAbs(),
                paper.get().getCitations(),
                authors,
                getMostPopularTasksByNumOfPapers(arxivId),
                getMostPopularMethodsByNumOfPapers(arxivId),
                codeResponses);
    }

    @Transactional
    public PaperTaskResponse getMostPopularTasksByNumOfPapers(String paperId) {
        List<Object[]> taskPapers = taskPaperRepository.getMostPopularTasksByNumOfPapers(paperId);

        String[] tasks = new String[taskPapers.size()];
        Long[] numPapers = new Long[taskPapers.size()];
        for (Object[] taskPaper : taskPapers) {
            tasks[taskPapers.indexOf(taskPaper)] = (String) taskPaper[0];
            numPapers[taskPapers.indexOf(taskPaper)] = (Long) taskPaper[1];
        }
        return new PaperTaskResponse(tasks, numPapers);
    }

    @Transactional
    public PaperMethodResponse getMostPopularMethodsByNumOfPapers(String paperId) {
        List<Object[]> methodPapers = methodPaperRepository.getMostPopularMethodsByNumOfPapers(paperId);

        String[] methods = new String[methodPapers.size()];
        Long[] numPapers = new Long[methodPapers.size()];
        for (Object[] methodPaper : methodPapers) {
            methods[methodPapers.indexOf(methodPaper)] = (String) methodPaper[0];
            numPapers[methodPapers.indexOf(methodPaper)] = (Long) methodPaper[1];
        }

        return new PaperMethodResponse(methods, numPapers);
    }

    @Transactional
    public List<PaperResponse> getMostCitedPapers() {
        List<Paper> papers = paperRepository.getMostCitedPapers();
        List<PaperResponse> paperResponses = new ArrayList<>();
        for (Paper paper : papers) {
            paperResponses.add(getPaperByArxivId(paper.getArxivId()));
        }
        return paperResponses;
    }

    @Transactional
    public List<FeaturedTaskAndMethodResponse> getFeaturedTasks() {
        List<Object[]> objects = taskPaperRepository.getMostPopularTasks();
        List<FeaturedTaskAndMethodResponse> featuredTaskAndMethodResponses = new ArrayList<>();
        for (Object[] object : objects) {
            featuredTaskAndMethodResponses.add(new FeaturedTaskAndMethodResponse((String) object[0], (Long) object[1]));
        }
        return featuredTaskAndMethodResponses;
    }

    @Transactional
    public List<FeaturedTaskAndMethodResponse> getFeaturedMethods() {
        List<Object[]> objects = methodPaperRepository.getMostPopularMethods();
        List<FeaturedTaskAndMethodResponse> featuredTaskAndMethodResponses = new ArrayList<>();
        for (Object[] object : objects) {
            featuredTaskAndMethodResponses.add(new FeaturedTaskAndMethodResponse((String) object[0], (Long) object[1]));
        }
        return featuredTaskAndMethodResponses;
    }

    @Transactional
    public List<PaperResponse> searchByTitle(String query) {
        List<Paper> papers = paperRepository.searchByTitle(query);
        List<PaperResponse> paperResponses = new ArrayList<>();
        for (Paper paper : papers) {
            paperResponses.add(getPaperByArxivId(paper.getArxivId()));
        }
        return paperResponses;
    }

    @Transactional
    public List<PaperResponse> getNewPapersByUserId(Long userId) {
        List<Paper> papers = paperRepository.getNewPapersByUserId(userId);
        List<PaperResponse> paperResponses = new ArrayList<>();
        for (Paper paper : papers) {
            paperResponses.add(getPaperByArxivId(paper.getArxivId()));
        }
        return paperResponses;
    }
}
