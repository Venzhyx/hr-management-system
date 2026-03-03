package com.projek.hr_backend.controller;

import com.projek.hr_backend.dto.ApiResponse;
import com.projek.hr_backend.dto.AttendanceRequest;
import com.projek.hr_backend.dto.AttendanceResponse;
import com.projek.hr_backend.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendances")
@RequiredArgsConstructor
public class AttendanceController {
    
    private final AttendanceService attendanceService;
    
    @PostMapping("/checkin")
    public ResponseEntity<ApiResponse<AttendanceResponse>> checkIn(@Valid @RequestBody AttendanceRequest request) {
        AttendanceResponse response = attendanceService.checkIn(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Check-in successful", response));
    }
    
    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<AttendanceResponse>> checkOut(@Valid @RequestBody AttendanceRequest request) {
        AttendanceResponse response = attendanceService.checkOut(request);
        return ResponseEntity.ok(ApiResponse.success("Check-out successful", response));
    }
    
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getAttendanceByEmployee(@PathVariable Long employeeId) {
        List<AttendanceResponse> responses = attendanceService.getAttendanceByEmployee(employeeId);
        return ResponseEntity.ok(ApiResponse.success("Attendance records retrieved successfully", responses));
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getAllAttendances(
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo,
            @RequestParam(required = false) Long employeeId) {
        List<AttendanceResponse> responses = attendanceService.getFilteredAttendances(dateFrom, dateTo, employeeId);
        return ResponseEntity.ok(ApiResponse.success("Attendance records retrieved successfully", responses));
    }
}
