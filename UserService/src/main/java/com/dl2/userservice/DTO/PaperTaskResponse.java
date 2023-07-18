package com.dl2.userservice.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PaperTaskResponse {
    private String[] taskName;
    private Long[] numPapers;
}
