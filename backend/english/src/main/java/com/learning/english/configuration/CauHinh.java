package com.learning.english.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CauHinh implements WebMvcConfigurer {

    private static final String UPLOAD_ROOT =
            System.getProperty("user.dir") + "/uploads/";

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:" + UPLOAD_ROOT + "images/");

        registry.addResourceHandler("/videos/**")
                .addResourceLocations("file:" + UPLOAD_ROOT + "videos/");

        registry.addResourceHandler("/audios/**")
                .addResourceLocations("file:" + UPLOAD_ROOT + "audios/");

        registry.addResourceHandler("/thumbnails/**")
                .addResourceLocations("file:" + UPLOAD_ROOT + "thumbnails/")
                .setCachePeriod(3600);

        registry.addResourceHandler("/certificates/**")
                .addResourceLocations("file:" + UPLOAD_ROOT + "certificates/")
                .setCachePeriod(3600);

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + UPLOAD_ROOT)
                .setCachePeriod(3600);
    }
}