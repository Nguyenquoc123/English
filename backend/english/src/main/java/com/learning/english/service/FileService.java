package com.learning.english.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileService {

    // uploads nằm cùng cấp với src, pom.xml
    private final String ROOT_DIR = System.getProperty("user.dir") + "/uploads/";

    public String saveFile(MultipartFile file, String subFolder) throws IOException {

        if (file == null || file.isEmpty()) {
            return null;
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";

        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String fileName = UUID.randomUUID() + extension;

        Path uploadPath = Paths.get(ROOT_DIR, subFolder);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(fileName);

        Files.copy(file.getInputStream(), filePath);

        return subFolder + "/" + fileName;
    }
}