package com.dl2.userservice.Service;

import com.dl2.userservice.DTO.PaperResponse;
import com.dl2.userservice.DTO.SingleTaskResponse;
import com.dl2.userservice.DTO.TaskMethodQuery;
import com.dl2.userservice.DTO.TaskResponse;
import com.dl2.userservice.Entity.Task;
import com.dl2.userservice.Repository.MethodRepository;
import com.dl2.userservice.Repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class TaskService {
    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private MethodRepository methodRepository;

    @Autowired
    private PaperService paperService;

    public List<TaskResponse> getTasks(int page, int size) {
        int offset = page * size;
        List<Object[]> taskPage = taskRepository.sortByNumPapers(offset, size);
        List<TaskResponse> responses = new ArrayList<>();
        for (Object[] task : taskPage) {
            String taskName = (String) task[1];
            List<Object[]> queries = methodRepository.getTopMethodsByTaskName(taskName);
            List<String> methods = new ArrayList<>();
            for (Object[] query : queries) {
                methods.add((String) query[1]);
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
        return taskRepository.count();
    }

    public SingleTaskResponse getTask(String taskName) {
        Optional<Task> task = taskRepository.getTaskByName(taskName);
        if (task.isEmpty()) {
            return null;
        }
        List<Object[]> queries = methodRepository.getTopMethodsByTaskName(taskName);
        List<String> methods = new ArrayList<>();
        List<Long> numPapers = new ArrayList<>();
        for (Object[] query : queries) {
            methods.add((String) query[1]);
            numPapers.add((Long) query[2]);
        }
        List<Object[]> paperQueries = taskRepository.getTopPapersByTaskName(taskName);
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
