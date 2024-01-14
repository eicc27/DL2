//package com.dl2.userservice.Controller;
//
//import com.dl2.userservice.Entity.Dataset;
//import com.dl2.userservice.Entity.Upload;
//import com.dl2.userservice.Repository.DatasetRepository;
//import com.dl2.userservice.Repository.UploadRepository;
//import com.dl2.userservice.Repository.UserRepository;
//import com.dl2.userservice.Response;
//import com.dl2.userservice.Security.JWTUtil;
//import com.dl2.userservice.Security.S3Config;
//import com.dl2.userservice.Service.DatasetService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Controller;
//import org.springframework.web.bind.annotation.*;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.BufferedReader;
//import java.io.File;
//import java.io.IOException;
//import java.io.InputStreamReader;
//import java.nio.file.Path;
//import java.nio.file.Paths;
//import java.util.ArrayList;
//import java.util.List;
//import java.util.Optional;
//import java.util.concurrent.ExecutionException;
//import java.util.concurrent.Executors;
//import java.util.concurrent.Future;
//import java.util.concurrent.TimeUnit;
//
//@Controller
//@RequestMapping("/eval")
//public class EvalController {
//    @Autowired
//    private DatasetService datasetService;
//
//    @Autowired
//    private DatasetRepository datasetRepository;
//
//    @Autowired
//    private UploadRepository uploadRepository;
//
//    @Autowired
//    private UserRepository userRepository;
//
//    private final JWTUtil util = new JWTUtil();
//
//    private final List<String> codes = new ArrayList<>();
//
//    private final S3Config config = new S3Config("dl2-user-data");
//
//    @PostMapping("/upload")
//    @ResponseBody
//    @CrossOrigin
//    public Response uploadToEval(
//            @RequestParam("name") String name,
//            @RequestParam("dataset") String dataset,
//            @RequestParam("file") MultipartFile file
//    ) throws IOException, InterruptedException, ExecutionException {
//        // create a temp folder to store the files
//        String path = "/tmp/" + dataset + '/' + name + '/';
//        // mkdir
//        File dir = new File(path);
//        dir.mkdirs();
//        System.out.println(path);
//        // first get the dataset
//        Dataset dts = datasetRepository.getDatasetByName(dataset).get();
//        String evalFile = dts.getTest(); // the python file to evaluate
//        String evalFileName = evalFile.split("/")[evalFile.split("/").length - 1];
//        String evalPath = dataset + "/private/"; // the parent folder of the eval file
//        List<String> evalObjects = config.listObjects(evalPath); // list all the files in the parent folder
//        // then get s3 files into the temp folder
//        for (String object : evalObjects) {
//            String[] parts = object.split("/");
//            System.out.println(path + parts[parts.length - 1]);
//            config.getObject(object, path + parts[parts.length - 1]);
//        }
//        // get the multipart file into the temp folder
//        String fileName = file.getOriginalFilename();
//        Path filePath = Paths.get(path + fileName);
//        try {
//            file.transferTo(filePath);
//        } catch (Exception e) {
//            e.printStackTrace();
//            return new Response(400, "Upload failed");
//        }
//        ProcessBuilder processBuilder = new ProcessBuilder("python", evalFileName, fileName);
//        processBuilder.directory(new File(path));
//        System.out.println(processBuilder.command());
//        Process process = processBuilder.start();
//        Future<String> outputReader = Executors.newSingleThreadExecutor().submit(() -> {
//            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
//                String lastLine = null;
//                String line;
//                while ((line = reader.readLine()) != null) {
//                    lastLine = line;
//                }
//                return lastLine;
//            }
//        });
//        // if execution fails, kill the process
//        if (process.waitFor() != 0) {
//            process.destroy();
//            return new Response(400, "Eval failed");
//        }
//        // if execute time exceeds 60s, kill the process
//        if (!process.waitFor(60, TimeUnit.SECONDS)) {
//            process.destroy();
//            return new Response(406, "Eval timeout");
//        }
//        // if exit value is not 0, kill the process
//        if (process.exitValue() != 0) {
//            process.destroy();
//            return new Response(400, "Eval failed");
//        }
//        String lastLine = outputReader.get();
//        Float acc = Float.parseFloat(lastLine);
//        // delete the temp folder
//        dir.delete();
//        // insert the data into the database
//        uploadRepository.save(new Upload(
//                null,
//                fileName,
//                null,
//                acc,
//                userRepository.findUserByName(name).get().getId(),
//                dataset
//        ));
//        return new Response(200, "Eval success", acc);
//    }
//
//    @PostMapping("/uploads3")
//    @ResponseBody
//    @CrossOrigin
//    public Response eval(
//            @RequestParam("name") String name,
//            @RequestParam("file") String file,
//            @RequestParam("dataset") String dataset
//    ) throws IOException, InterruptedException, ExecutionException {
//        String path = "/tmp/" + dataset + '/' + name + '/';
//        File dir = new File(path);
//        dir.mkdirs();
//        System.out.println(path);
//        Optional<Dataset> dts = datasetRepository.getDatasetByName(dataset);
//        if (dts.isEmpty())
//            return new Response(400, "Dataset not found");
//        String evalFile = dts.get().getTest();
//        String evalFileName = evalFile.split("/")[evalFile.split("/").length - 1];
//        String evalPath = dataset + "/private/"; // the parent folder of the eval file
//        List<String> evalObjects = config.listObjects(evalPath); // list all the files in the parent folder
//        // then get s3 files into the temp folder
//        for (String object : evalObjects) {
//            String[] parts = object.split("/");
//            System.out.println(path + parts[parts.length - 1]);
//            config.getObject(object, path + parts[parts.length - 1]);
//        }
//        // get the file into the temp folder
//        String testFileName = file.split("/")[file.split("/").length - 1];
//        config.getObject(file, path + testFileName);
//        ProcessBuilder processBuilder = new ProcessBuilder("python", evalFileName, testFileName);
//        processBuilder.directory(new File(path));
//        System.out.println(processBuilder.command());
//        Process process = processBuilder.start();
//        Future<String> outputReader = Executors.newSingleThreadExecutor().submit(() -> {
//            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
//                String lastLine = null;
//                String line;
//                while ((line = reader.readLine()) != null) {
//                    lastLine = line;
//                }
//                return lastLine;
//            }
//        });
//        // if execution fails, kill the process
//        if (process.waitFor() != 0) {
//            process.destroy();
//            return new Response(400, "Eval failed");
//        }
//        // if execute time exceeds 60s, kill the process
//        if (!process.waitFor(60, TimeUnit.SECONDS)) {
//            process.destroy();
//            return new Response(406, "Eval timeout");
//        }
//        // if exit value is not 0, kill the process
//        if (process.exitValue() != 0) {
//            process.destroy();
//            return new Response(400, "Eval failed");
//        }
//        String lastLine = outputReader.get();
//        Float acc = Float.parseFloat(lastLine);
//        System.out.println(acc);
//        // delete the temp folder
//        dir.delete();
//        // insert the data into the database
//        uploadRepository.save(new Upload(
//                null,
//                testFileName,
//                null,
//                acc,
//                userRepository.findUserByName(name).get().getId(),
//                dataset
//        ));
//        return new Response(200, "Eval success", acc);
//    }
//
//
//    @PostMapping("/upload-lambda")
//    @ResponseBody
//    @CrossOrigin
//    public Response uploadToLambdaEval(
//            @RequestParam("name") String name,
//            @RequestParam("dataset") String dataset,
//            @RequestParam("file") MultipartFile file) {
//
//    }
//}
