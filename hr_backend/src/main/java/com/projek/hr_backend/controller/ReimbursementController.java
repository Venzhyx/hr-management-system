package com.projek.hr_backend.controller;

import com.projek.hr_backend.dto.ApiResponse;
import com.projek.hr_backend.dto.ApprovalActionRequest;
import com.projek.hr_backend.dto.ReimbursementRequest;
import com.projek.hr_backend.dto.ReimbursementResponse;
import com.projek.hr_backend.service.ReimbursementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reimbursements")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReimbursementController {
    
    private final ReimbursementService service;
    
    @PostMapping
    public ResponseEntity<ApiResponse<ReimbursementResponse>> createReimbursement(
            @Valid @RequestBody ReimbursementRequest request) {
        ReimbursementResponse response = service.createReimbursement(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Reimbursement created successfully", response));
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<ReimbursementResponse>>> getAllReimbursements() {
        List<ReimbursementResponse> responses = service.getAllReimbursements();
        return ResponseEntity.ok(new ApiResponse<>(true, "Reimbursements retrieved successfully", responses));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReimbursementResponse>> getReimbursement(@PathVariable Long id) {
        ReimbursementResponse response = service.getReimbursement(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Reimbursement retrieved successfully", response));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ReimbursementResponse>> updateReimbursement(
            @PathVariable Long id,
            @Valid @RequestBody ReimbursementRequest request) {
        ReimbursementResponse response = service.updateReimbursement(id, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Reimbursement updated successfully", response));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReimbursement(@PathVariable Long id) {
        service.deleteReimbursement(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Reimbursement deleted successfully", null));
    }
    
    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<ReimbursementResponse>> approveReimbursement(
            @PathVariable Long id,
            @Valid @RequestBody ApprovalActionRequest request) {
        ReimbursementResponse response = service.approveReimbursement(id, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Reimbursement approved successfully", response));
    }
    
    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<ReimbursementResponse>> rejectReimbursement(
            @PathVariable Long id,
            @Valid @RequestBody ApprovalActionRequest request) {
        ReimbursementResponse response = service.rejectReimbursement(id, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Reimbursement rejected successfully", response));
    }
}
