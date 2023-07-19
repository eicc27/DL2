package com.dl2.userservice.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PaperResponse {
    private String arxivId;
    private String title;
    private String abs;
    private Long citations;
    private String[] authors;
    private PaperTaskResponse tasks;
    private PaperMethodResponse methods;
    private CodeResponse[] codes;
}
