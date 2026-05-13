package com.learning.english.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CauHinh implements WebMvcConfigurer {

    private static final String UPLOAD_ROOT = "file:D:/uploads/";

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Media tĩnh: ảnh, video, audio của bài học
        registry.addResourceHandler("/images/**")
                .addResourceLocations(UPLOAD_ROOT + "images/");
        registry.addResourceHandler("/videos/**")
                .addResourceLocations(UPLOAD_ROOT + "videos/");
        registry.addResourceHandler("/audios/**")
                .addResourceLocations(UPLOAD_ROOT + "audios/");

        // File upload: thumbnail khóa học, chứng chỉ giáo viên
        registry.addResourceHandler("/thumbnails/**")
                .addResourceLocations(UPLOAD_ROOT + "thumbnails/")
                .setCachePeriod(3600);
        registry.addResourceHandler("/certificates/**")
                .addResourceLocations(UPLOAD_ROOT + "certificates/")
                .setCachePeriod(3600);

        // Fallback chung cho toàn bộ thư mục uploads
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(UPLOAD_ROOT)
                .setCachePeriod(3600);
    }
}
