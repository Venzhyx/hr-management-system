package com.projek.hr_backend.controller;

import com.projek.hr_backend.dto.ApiResponse;
import com.projek.hr_backend.dto.ApprovalSettingRequest;
import com.projek.hr_backend.dto.ApprovalSettingResponse;
import com.projek.hr_backend.service.ApprovalSettingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/approval-settings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ApprovalSettingController {
    
    private final ApprovalSettingService service;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<ApprovalSettingResponse>>> getAllSettings() {
        List<ApprovalSettingResponse> responses = service.getAllSettings();
        return ResponseEntity.ok(new ApiResponse<>(true, "Approval settings retrieved successfully", responses));
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<ApprovalSettingResponse>> createSetting(
            @Valid @RequestBody ApprovalSettingRequest request) {
        ApprovalSettingResponse response = service.createSetting(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Approval setting created successfully", response));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ApprovalSettingResponse>> updateSetting(
            @PathVariable Long id,
            @Valid @RequestBody ApprovalSettingRequest request) {
        ApprovalSettingResponse response = service.updateSetting(id, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Approval setting updated successfully", response));
    }
}
