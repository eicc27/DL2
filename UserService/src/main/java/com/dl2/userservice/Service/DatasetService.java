package com.dl2.userservice.Service;

import com.dl2.userservice.DTO.DatasetResponse;
import com.dl2.userservice.DTO.DatasetUploadRequest;
import com.dl2.userservice.DTO.FeaturedDatasetResponse;
import com.dl2.userservice.DTO.UploadResponse;
import com.dl2.userservice.Entity.Dataset;
import com.dl2.userservice.Entity.Upload;
import com.dl2.userservice.Repository.DatasetRepository;
import com.dl2.userservice.Repository.UploadRepository;
import com.dl2.userservice.Repository.UserRepository;
import com.dl2.userservice.Security.JWTUtil;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class DatasetService {

    @Autowired
    private DatasetRepository datasetRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UploadRepository uploadRepository;

    private final JWTUtil util = new JWTUtil();

    @Transactional
    public boolean insertDataset(DatasetUploadRequest request, String path, String test) {
        String name = request.getName();
        if (datasetRepository.getDatasetByName(name).isPresent()) {
            return false;
        }
        String jwt = request.getJwt();
        String userName = util.getUserName(jwt);
        Long userId = userRepository.findUserByName(userName).get().getId();
        String task = request.getTask();
        String desc = request.getDesc();
        Dataset dataset = new Dataset(name, task, userId, desc, path, test, "DESC", null);
        datasetRepository.save(dataset);
        return true;
    }

    @Transactional
    public FeaturedDatasetResponse getTrendingDatasets() {
        List<Object[]> datasets = datasetRepository.getTrendingDatasets();
        List<DatasetResponse> responses = new ArrayList<>();
        for (Object[] dataset : datasets) {
            String name = (String) dataset[0];
            String task = (String) dataset[1];
            Long userId = (Long) dataset[4];
            Date date = (Date) dataset[5];
            String intro = (String) dataset[6];
            List<Upload> uploads = uploadRepository.getUploadsByDatasetOrderByScoreDesc(name);
            List<UploadResponse> uploadResponses = new ArrayList<>();
            int i = 0;
            for (Upload upload : uploads) {
                if (i >= 3) {
                    break;
                }
                String userName = userRepository.findUserById(upload.getUser()).get().getName();
                String acc = upload.getScore().toString();
                String time = upload.getDate().toString();
                uploadResponses.add(new UploadResponse(userName, upload.getName(), acc, time));
                i++;
            }
            responses.add(new DatasetResponse(name,
                    task,
                    intro,
                    userRepository.findUserById(userId).get().getName(),
                    date.toString(),
                    uploadResponses));
        }
        return new FeaturedDatasetResponse(
                datasetRepository.count(),
                uploadRepository.count(),
                responses
        );
    }

    @Transactional
    public DatasetResponse getDatasetByName(String name) {
        Dataset dataset = datasetRepository.getDatasetByName(name).get();
        String task = dataset.getTask();
        Long userId = dataset.getUser();
        String intro = dataset.getIntro();
        Date date = dataset.getDate();
        List<Upload> uploads = uploadRepository.getUploadsByDatasetOrderByScoreDesc(name);
        List<UploadResponse> uploadResponses = new ArrayList<>();
        int i = 0;
        for (Upload upload : uploads) {
            if (i >= 30) {
                break;
            }
            String userName = userRepository.findUserById(upload.getUser()).get().getName();
            String acc = upload.getScore().toString();
            String time = upload.getDate().toString();
            uploadResponses.add(new UploadResponse(userName, upload.getName(), acc, time));
            i++;
        }
        return new DatasetResponse(name,
                task,
                intro,
                userRepository.findUserById(userId).get().getName(),
                date.toString(),
                uploadResponses);
    }

    @Transactional
    public DatasetResponse getDatasetByNameAndUser(String name, String user) {
        Dataset dataset = datasetRepository.getDatasetByName(name).get();
        String task = dataset.getTask();
        Long userId = dataset.getUser();
        String intro = dataset.getIntro();
        Date date = dataset.getDate();
        List<Object[]> objects = uploadRepository.getUserUploadsAndTopUploads(name, user);
        List<UploadResponse> responses = new ArrayList<>();
        for (Object[] object : objects) {
            String uploadName = (String) object[1];
            Date uploadDate = (Date) object[2];
            Float score = (Float) object[3];
            responses.add(new UploadResponse(user, uploadName, score.toString(), uploadDate.toString()));
        }
        return new DatasetResponse(
                name,
                task,
                intro,
                userRepository.findUserById(userId).get().getName(),
                date.toString(),
                responses);
    }

}
