package com.projek.hr_backend.controller;

import com.projek.hr_backend.dto.ApiResponse;
import com.projek.hr_backend.dto.OvertimeRequest;
import com.projek.hr_backend.dto.OvertimeResponse;
import com.projek.hr_backend.service.OvertimeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/overtimes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OvertimeController {

    private final OvertimeService service;

    @PostMapping
    public ResponseEntity<ApiResponse<OvertimeResponse>> createOvertime(
            @Valid @RequestBody OvertimeRequest request) {
        OvertimeResponse response = service.createOvertime(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Overtime request created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OvertimeResponse>>> getAllOvertimes() {
        List<OvertimeResponse> responses = service.getAllOvertimes();
        return ResponseEntity.ok(new ApiResponse<>(true, "Overtimes retrieved successfully", responses));
    }

    @GetMapping("/my/{employeeId}")
    public ResponseEntity<ApiResponse<List<OvertimeResponse>>> getMyOvertimes(
            @PathVariable Long employeeId) {
        List<OvertimeResponse> responses = service.getOvertimesByEmployee(employeeId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Overtimes retrieved successfully", responses));
    }

    @GetMapping("/total/{employeeId}")
    public ResponseEntity<ApiResponse<Double>> getTotalOvertime(
            @PathVariable Long employeeId,
            @RequestParam int month,
            @RequestParam int year) {
        Double total = service.getTotalOvertimeByEmployee(employeeId, month, year);
        return ResponseEntity.ok(new ApiResponse<>(true, "Total overtime hours retrieved", total));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<OvertimeResponse>> approveOvertime(
            @PathVariable Long id,
            @RequestParam Long adminId) {
        OvertimeResponse response = service.approveOvertime(id, adminId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Overtime approved successfully", response));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<OvertimeResponse>> rejectOvertime(
            @PathVariable Long id,
            @RequestParam Long adminId) {
        OvertimeResponse response = service.rejectOvertime(id, adminId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Overtime rejected successfully", response));
    }
}
