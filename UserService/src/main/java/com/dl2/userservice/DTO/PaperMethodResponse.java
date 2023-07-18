package com.dl2.userservice.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PaperMethodResponse {
    private String[] methodName;
    private Long[] numPapers;
}
