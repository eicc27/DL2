package com.dl2.neo4jservice.neo4jservice.Service;

import com.dl2.neo4jservice.neo4jservice.DTO.PaperResponse;
import com.dl2.neo4jservice.neo4jservice.Entity.Paper;
import com.dl2.neo4jservice.neo4jservice.Repository.PaperRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class PaperService {
    @Autowired
    private PaperRepository paperRepository;

//    @Transactional
    public PaperResponse findNearbyPaper(List<String> paperIds) {
        List<Paper> NearbyPapers = paperRepository.findNearbyPapers(paperIds);
        if (NearbyPapers == null) {
            // 处理找不到给定ID的论文的情况
            return null;
        }
        String[] nearbyPaperIds = new String[NearbyPapers.size()];
        Long[] nearbyPaperCitations = new Long[NearbyPapers.size()];
        for(Paper p : NearbyPapers) {
            nearbyPaperIds[NearbyPapers.indexOf(p)] = p.getPaperId();
            nearbyPaperCitations[NearbyPapers.indexOf(p)] = p.getCitedNum();
        }
        return new PaperResponse(nearbyPaperIds, nearbyPaperCitations);
    }

}
