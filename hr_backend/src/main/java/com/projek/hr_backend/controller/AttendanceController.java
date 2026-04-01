package com.projek.hr_backend.controller;

import com.projek.hr_backend.dto.ApiResponse;
import com.projek.hr_backend.model.Attendance;
import com.projek.hr_backend.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/attendances")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AttendanceController {

    private final AttendanceService service;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<String>> uploadExcel(@RequestParam("file") MultipartFile file) throws IOException {
        service.importExcel(file);
        return ResponseEntity.ok(new ApiResponse<>(true, "Upload success", null));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Attendance>>> getAllAttendances() {
        List<Attendance> attendances = service.getAllAttendances();
        return ResponseEntity.ok(new ApiResponse<>(true, "Attendances retrieved successfully", attendances));
    }

    @GetMapping("/employee/{id}")
    public ResponseEntity<ApiResponse<List<Attendance>>> getAttendancesByEmployee(@PathVariable Long id) {
        List<Attendance> attendances = service.getAttendancesByEmployee(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Attendances retrieved successfully", attendances));
    }
}
