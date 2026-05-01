package com.learning.english.dto.response;


import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StudentProfileResponse {
    String fullName;          
    String username;          
    String email;             
    String avatarUrl;         
    String status;            
    LocalDateTime createdAt;  
    LocalDateTime updatedAt;  
}