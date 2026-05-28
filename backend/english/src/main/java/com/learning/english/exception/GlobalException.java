package com.learning.english.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalException {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Object> handleRuntime(RuntimeException ex) {
        return ResponseEntity.badRequest().body(errorBody(HttpStatus.BAD_REQUEST, ex.getMessage()));
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<Object> handleDataAccess(DataAccessException ex) {
        String message = resolveDataAccessMessage(ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorBody(HttpStatus.INTERNAL_SERVER_ERROR, message));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGeneric(Exception ex) {
        String message = ex.getMessage() != null ? ex.getMessage() : "Lỗi hệ thống";
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorBody(HttpStatus.INTERNAL_SERVER_ERROR, message));
    }

    private String resolveDataAccessMessage(DataAccessException ex) {
        Throwable root = ex.getMostSpecificCause();
        String rootMsg = root != null && root.getMessage() != null ? root.getMessage() : ex.getMessage();
        if (rootMsg != null && rootMsg.toLowerCase().contains("student_bank_accounts")) {
            return "Bảng student_bank_accounts chưa có trong database. "
                    + "Hãy chạy file backend/english/migrations/create_student_bank_accounts.sql rồi khởi động lại backend.";
        }
        return rootMsg != null ? rootMsg : "Lỗi truy vấn cơ sở dữ liệu";
    }

    private Map<String, Object> errorBody(HttpStatus status, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        return body;
    }
}
