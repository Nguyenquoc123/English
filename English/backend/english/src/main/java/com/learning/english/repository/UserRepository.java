package com.learning.english.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.learning.english.entity.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    
    Optional<User> findByUsername(String username);

    
    Optional<User> findByEmail(String email);

    
    Optional<User> findByUsernameOrEmail(String username, String email);

    
    boolean existsByEmailAndUserIdNot(String email, Long userId);

    
    boolean existsByUsername(String username);

    
    boolean existsByEmail(String email);

    
    long countByRole_RoleName(String roleName);

    
    List<User> findAllByOrderByCreatedAtDesc();

    
    @Query("SELECT u FROM User u WHERE " +
           "(:keyword IS NULL OR LOWER(u.username) LIKE LOWER(CONCAT('%',:keyword,'%')) " +
           " OR LOWER(u.email) LIKE LOWER(CONCAT('%',:keyword,'%')) " +
           " OR LOWER(u.fullName) LIKE LOWER(CONCAT('%',:keyword,'%'))) " +
           "AND (:roleName IS NULL OR u.role.roleName = :roleName) " +
           "AND (:status IS NULL OR u.status = :status) " +
           "ORDER BY u.createdAt DESC")
    List<User> searchUsers(@Param("keyword") String keyword,
                           @Param("roleName") String roleName,
                           @Param("status") String status);
}
