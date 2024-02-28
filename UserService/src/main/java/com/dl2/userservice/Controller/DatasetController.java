//package com.dl2.userservice.Controller;
//
//import com.dl2.userservice.DTO.DatasetUploadRequest;
//import com.dl2.userservice.DTO.JwtRequest;
//import com.dl2.userservice.Response;
//import com.dl2.userservice.Security.JWTUtil;
//import com.dl2.userservice.Security.S3Config;
//import com.dl2.userservice.Service.DatasetService;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.core.io.InputStreamResource;
//import org.springframework.http.ResponseEntity;
//import org.springframework.stereotype.Controller;
//import org.springframework.web.bind.annotation.*;
//import org.springframework.web.multipart.MultipartFile;
//import software.amazon.awssdk.core.ResponseInputStream;
//import software.amazon.awssdk.services.s3.model.GetObjectResponse;
//
//import java.util.ArrayList;
//import java.util.List;
//
//
//@Controller
//@RequestMapping("/dataset")
//public class DatasetController {
//    private final S3Config config = new S3Config("dl2-user-data");
//
//    private final JWTUtil util = new JWTUtil();
//
//    @Autowired
//    private DatasetService datasetService;
//
//    @PostMapping("/upload")
//    @ResponseBody
//    @CrossOrigin
//    public Response uploadDataset(
//            @RequestParam("uploadRequest") String request,
//            @RequestParam("files") MultipartFile[] files,
//            @RequestParam("eval") MultipartFile[] evalFiles,
//            @RequestParam("script") MultipartFile[] scriptFiles
//    ) {
//        ObjectMapper mapper = new ObjectMapper();
//        try {
//            DatasetUploadRequest uploadRequest = mapper.readValue(request, DatasetUploadRequest.class);
//            String jwt = uploadRequest.getJwt();
//            String name = uploadRequest.getName();
//            String userName = util.getUserName(jwt);
//            // join userName and name
//            String key = name + "/";
//            String pythonFile = scriptFiles[0].getOriginalFilename();
//            if (!datasetService.insertDataset(
//                    uploadRequest,
//                    key + "public/",
//                    key + "private/" + pythonFile
//            )) {
//                return new Response(400, "Dataset already exists.");
//            }
//            for (MultipartFile file : files) {
//                config.putObject(file, key + "public/");
//            }
//            for (MultipartFile file : evalFiles) {
//                config.putObject(file, key + "private/");
//            }
//            for (MultipartFile file : scriptFiles) {
//                config.putObject(file, key + "private/");
//            }
//        } catch (Exception e) {
//            e.printStackTrace();
//            return new Response(500, "Internal server error.");
//        }
//        return new Response(200, "Success.");
//    }
//
//    @GetMapping("/datasets")
//    @ResponseBody
//    @CrossOrigin
//    public Response getTrendingDatasets() {
//        return new Response(200, "Success.", datasetService.getTrendingDatasets());
//    }
//
//    @GetMapping("/{dataset}")
//    @ResponseBody
//    @CrossOrigin
//    public Response getDataset(@PathVariable("dataset") String dataset) {
//        return new Response(200, "Success.", datasetService.getDatasetByName(dataset));
//    }
//
//    @PostMapping("/{dataset}")
//    @ResponseBody
//    @CrossOrigin
//    public Response getDataset(@PathVariable("dataset") String dataset, @RequestBody JwtRequest request) {
//        String jwt = request.getJwt();
//        String userName = util.getUserName(jwt);
//        return new Response(200, "Success.", datasetService.getDatasetByNameAndUser(dataset, userName));
//    }
//
//    @GetMapping("/download/{filename}")
//    @ResponseBody
//    @CrossOrigin
//    public Response downloadFile(@PathVariable("filename") String filename) {
//        String path = filename + "/public/";
//        List<String> files = config.listObjects(path);
//        if (files == null) {
//            return new Response(400, "Dataset does not exist.");
//        }
//        List<String> urls = new ArrayList<>();
//        for (String file : files) {
//            String url = config.getObject(file);
//            if (url == null) {
//                return new Response(500, "Internal server error.");
//            }
//            urls.add(url);
//        }
//        return new Response(200, "Success.", urls);
//    }
//}
