package com.projek.hr_backend.controller;

import com.projek.hr_backend.dto.ApiResponse;
import com.projek.hr_backend.dto.TimeOffApprovalRequest;
import com.projek.hr_backend.model.TimeOffApproval;
import com.projek.hr_backend.service.TimeOffApprovalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/time-off-approvals")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TimeOffApprovalController {

    private final TimeOffApprovalService service;

    @GetMapping("/request/{requestId}")
    public ResponseEntity<ApiResponse<List<TimeOffApproval>>> getByRequest(@PathVariable Long requestId) {
        List<TimeOffApproval> approvals = service.getByRequest(requestId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Approvals retrieved successfully", approvals));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> approveOrReject(
            @PathVariable Long id,
            @Valid @RequestBody TimeOffApprovalRequest request) {
        service.approveOrReject(id, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Approval updated successfully", null));
    }
}
