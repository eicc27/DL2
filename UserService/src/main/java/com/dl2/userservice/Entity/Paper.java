package com.dl2.userservice.Entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.Year;

@Data
@Entity
public class Paper {
    @Id
    @Column(name = "arxiv_id")
    private String arxivId;

    private String title;

    private Year year;

    @Column(name="abstract", length = 10000)
    private String abs;

    private Long citations;

    public static Year fromArxivId(String id) {
        String yearPart = id.substring(0, 2);
        int year = Integer.parseInt(yearPart);
        year += (year > 91) ? 1900 : 2000;
        return Year.of(year);
    }
}
