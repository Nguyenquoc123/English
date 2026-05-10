package com.learning.english.configuration;



import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.fasterxml.jackson.databind.ObjectMapper;

@Configuration
public class CauHinh implements WebMvcConfigurer{
	private final String IMAGE_UPLOAD_PATH = "file:///D:/uploads/images/";
    private final String VIDEO_UPLOAD_PATH = "file:///D:/uploads/videos/";
	
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Ánh xạ request URL '/images/**' tới thư mục vật lý IMAGE_UPLOAD_PATH
        registry.addResourceHandler("/images/**")
                .addResourceLocations(IMAGE_UPLOAD_PATH);
     // Ánh xạ request URL '/videos/**' tới thư mục vật lý VIDEO_UPLOAD_PATH
        registry.addResourceHandler("/videos/**")
        .addResourceLocations(VIDEO_UPLOAD_PATH);
       
    }
    
   
}
