package com.projek.hr_backend.controller;

import com.projek.hr_backend.dto.ApiResponse;
import com.projek.hr_backend.dto.AttendanceCorrectionRequest;
import com.projek.hr_backend.dto.AttendanceCorrectionResponse;
import com.projek.hr_backend.service.AttendanceCorrectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance-corrections")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AttendanceCorrectionController {

    private final AttendanceCorrectionService service;

    @PostMapping
    public ResponseEntity<ApiResponse<AttendanceCorrectionResponse>> createCorrection(
            @Valid @RequestBody AttendanceCorrectionRequest request) {
        AttendanceCorrectionResponse response = service.createCorrection(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Correction request created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AttendanceCorrectionResponse>>> getAllCorrections() {
        List<AttendanceCorrectionResponse> responses = service.getAllCorrections();
        return ResponseEntity.ok(new ApiResponse<>(true, "Corrections retrieved successfully", responses));
    }

    @GetMapping("/my/{employeeId}")
    public ResponseEntity<ApiResponse<List<AttendanceCorrectionResponse>>> getMyCorrections(
            @PathVariable Long employeeId) {
        List<AttendanceCorrectionResponse> responses = service.getCorrectionsByEmployee(employeeId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Corrections retrieved successfully", responses));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<AttendanceCorrectionResponse>> approveCorrection(
            @PathVariable Long id,
            @RequestParam Long approverId) {
        AttendanceCorrectionResponse response = service.approveCorrection(id, approverId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Correction approved successfully", response));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<AttendanceCorrectionResponse>> rejectCorrection(
            @PathVariable Long id,
            @RequestParam Long approverId) {
        AttendanceCorrectionResponse response = service.rejectCorrection(id, approverId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Correction rejected successfully", response));
    }
}
