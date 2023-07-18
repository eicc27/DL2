package com.dl2.userservice.Service;

import com.dl2.userservice.DTO.CodeResponse;
import com.dl2.userservice.DTO.PaperResponse;
import com.dl2.userservice.DTO.TaskAndMethodResponse;
import com.dl2.userservice.Entity.*;
import com.dl2.userservice.Repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
                tasks,
                methods,
                codeResponses);
    }

}
