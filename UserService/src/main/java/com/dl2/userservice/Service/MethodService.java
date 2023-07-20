package com.dl2.userservice.Service;

import com.dl2.userservice.DTO.PaperResponse;
import com.dl2.userservice.DTO.SingleTaskResponse;
import com.dl2.userservice.DTO.TaskResponse;
import com.dl2.userservice.Entity.Method;
import com.dl2.userservice.Entity.Task;
import com.dl2.userservice.Repository.MethodRepository;
import com.dl2.userservice.Repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class MethodService {
    @Autowired
    private MethodRepository methodRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private PaperService paperService;

    public List<TaskResponse> getMethods(int page, int size) {
        int offset = page * size;
        List<Object[]> taskPage = methodRepository.sortByNumPapers(offset, size);
        List<TaskResponse> responses = new ArrayList<>();
        for (Object[] task : taskPage) {
            String taskName = (String) task[1];
            List<Object[]> queries = taskRepository.getTopTasksByMethodName(taskName);
            List<String> methods = new ArrayList<>();
            for (Object[] query : queries) {
                methods.add((String) query[0]);
            }
            responses.add(new TaskResponse(taskName,
                    methods,
                    (Long) task[0],
                    (String) task[2]
            ));
        }
        return responses;
    }

    public Long countAll() {
        return methodRepository.count();
    }

    public SingleTaskResponse getMethod(String taskName) {
        System.out.println(taskName);
        Optional<Method> task = methodRepository.getMethodByName(taskName);
        System.out.println(task);
        if (task.isEmpty()) {
            return null;
        }
        List<Object[]> queries = taskRepository.getTopTasksByMethodName(taskName);
        List<String> methods = new ArrayList<>();
        List<Long> numPapers = new ArrayList<>();
        for (Object[] query : queries) {
            methods.add((String) query[0]);
            numPapers.add((Long) query[2]);
        }
        List<Object[]> paperQueries = methodRepository.getTopPapersByMethodName(taskName);
        List<PaperResponse> paperResponses = new ArrayList<>();
        for (Object[] paperQuery : paperQueries) {
            String arxivId = (String) paperQuery[0];
            paperResponses.add(paperService.getPaperByArxivId(arxivId));
        }
        return new SingleTaskResponse(taskName,
                task.get().getIntro(),
                methods,
                numPapers,
                paperResponses
        );
    }
}
