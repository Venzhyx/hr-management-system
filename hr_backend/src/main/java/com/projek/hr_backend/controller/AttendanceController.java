package com.projek.hr_backend.controller;

import com.projek.hr_backend.dto.ApiResponse;
import com.projek.hr_backend.model.Attendance;
import com.projek.hr_backend.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllAttendances() {
        List<Attendance> attendances = service.getAllAttendances();
        return ResponseEntity.ok(new ApiResponse<>(true, "Attendances retrieved successfully", toDto(attendances)));
    }

    @GetMapping("/employee/{id}")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAttendancesByEmployee(@PathVariable Long id) {
        List<Attendance> attendances = service.getAttendancesByEmployee(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Attendances retrieved successfully", toDto(attendances)));
    }

    // ── Helper: ubah Attendance → Map sederhana tanpa circular reference ──────
    private List<Map<String, Object>> toDto(List<Attendance> attendances) {
        return attendances.stream().map(att -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id",           att.getId());
            map.put("date",         att.getDate());
            map.put("checkIn",      att.getCheckIn());
            map.put("checkOut",     att.getCheckOut());
            map.put("status",       att.getStatus());
            map.put("employeeCode", att.getEmployeeCode());
            map.put("employeeName", att.getEmployeeName());
            map.put("createdAt",    att.getCreatedAt());

            if (att.getEmployee() != null) {
                Map<String, Object> emp = new LinkedHashMap<>();
                emp.put("id",   att.getEmployee().getId());
                emp.put("name", att.getEmployee().getName());
                map.put("employee", emp);
            }

            return map;
        }).collect(Collectors.toList());
    }
}