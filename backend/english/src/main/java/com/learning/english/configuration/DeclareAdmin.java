package com.learning.english.configuration;



import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.learning.english.entity.Role;
import com.learning.english.entity.User;
import com.learning.english.repository.RoleRepository;
import com.learning.english.repository.UserRepository;


@Component
public class DeclareAdmin implements CommandLineRunner{
	@Autowired
	UserRepository userRepository;
	
	@Autowired
	RoleRepository roleRepository;
	
	@Autowired
	PasswordEncoder passwordEncoder;
	
	@Override
	public void run(String... args){
		
		Role role = roleRepository.findByRoleName("Admin").orElseThrow(() -> new RuntimeException("Không tìm thấy role"));
		Optional<User> admin_ = userRepository.findByUsername("admin");
		if(admin_.isEmpty()) {
			try {
				
				User user = User.builder()
						.username("admin")
						.email("admin@gmail.com")
						.fullName("Admin")
						.password(passwordEncoder.encode("11111111"))
						.status("active")
						.role(role)
						.createdAt(LocalDateTime.now())
						.updatedAt(LocalDateTime.now())
						.build();
				userRepository.save(user);
				System.out.println(passwordEncoder.encode("11111111"));
			} catch (Exception e) {
				e.printStackTrace();
				throw new RuntimeException("Lỗi hệ thống");
			}
		}
	}
}