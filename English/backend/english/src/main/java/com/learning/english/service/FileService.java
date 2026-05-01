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
	 private final String ROOT_DIR = "D:/uploads/";

	 public String saveFile(MultipartFile file, String subFolder) throws IOException {
	        if (file == null || file.isEmpty()) return null;

	        String originalFilename = file.getOriginalFilename(); // lấy tên file
	        String extension = "";

	        if (originalFilename != null && originalFilename.contains(".")) {
	            extension = originalFilename.substring(originalFilename.lastIndexOf(".")); // lấy đuôi file
	        }

	        String fileName = UUID.randomUUID() + extension; // tạo tên mới

	        Path uploadPath = Paths.get(ROOT_DIR + subFolder); // tạo thư mục
	        if (!Files.exists(uploadPath)) { // tạo thư mục nếu chưa có
	            Files.createDirectories(uploadPath);
	        }

	        Path filePath = uploadPath.resolve(fileName); // ghép thành đường dẫn
	        Files.copy(file.getInputStream(), filePath); // lưu

	        return subFolder + "/" + fileName;
	    }
}
