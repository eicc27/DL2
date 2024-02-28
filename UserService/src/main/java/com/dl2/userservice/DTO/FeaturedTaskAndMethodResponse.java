package com.dl2.userservice.DTO;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FeaturedTaskAndMethodResponse {
    private String name;
    private String intro;
    private Long paperNum;
}
