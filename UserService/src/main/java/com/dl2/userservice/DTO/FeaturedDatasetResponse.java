package com.dl2.userservice.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FeaturedDatasetResponse {
    private Long dtsNum;
    private Long implNum;
    private List<DatasetResponse> datasets;
}
