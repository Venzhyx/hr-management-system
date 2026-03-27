package com.projek.hr_backend.service;

import com.projek.hr_backend.dto.TimeOffApprovalRequest;
import com.projek.hr_backend.exception.ResourceNotFoundException;
import com.projek.hr_backend.model.*;
import com.projek.hr_backend.repository.TimeOffApprovalRepository;
import com.projek.hr_backend.repository.TimeOffRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TimeOffApprovalService {

    private final TimeOffApprovalRepository approvalRepository;
    private final TimeOffRequestRepository requestRepository;

    private static final int MINIMUM_APPROVAL = 1;

    public List<TimeOffApproval> getByRequest(Long requestId) {
        return approvalRepository.findByTimeOffRequestId(requestId);
    }

    @Transactional
    public void approveOrReject(Long id, TimeOffApprovalRequest request) {
        String action = request.getAction().toUpperCase();
        if (!action.equals("APPROVED") && !action.equals("REJECTED")) {
            throw new IllegalArgumentException("Invalid action. Must be APPROVED or REJECTED");
        }

        TimeOffApproval approval = approvalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Time off approval not found with id: " + id));

        if (!approval.getStatus().equals(ApprovalStatus.PENDING)) {
            throw new IllegalStateException("Approval already processed");
        }

        approval.setStatus(ApprovalStatus.valueOf(action));
        approval.setNotes(request.getNotes());
        approval.setActionAt(LocalDateTime.now());
        approvalRepository.save(approval);

        updateTimeOffRequestStatus(approval.getTimeOffRequest().getId());
    }

    private void updateTimeOffRequestStatus(Long requestId) {
        TimeOffRequest timeOffRequest = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Time off request not found"));

        List<TimeOffApproval> allApprovals = approvalRepository.findByTimeOffRequestId(requestId);

        boolean hasRejected = allApprovals.stream()
                .anyMatch(a -> a.getStatus() == ApprovalStatus.REJECTED);

        if (hasRejected) {
            timeOffRequest.setStatus(TimeOffRequestStatus.REJECTED);
            requestRepository.save(timeOffRequest);
            return;
        }

        long approvedCount = allApprovals.stream()
                .filter(a -> a.getStatus() == ApprovalStatus.APPROVED)
                .count();

        if (approvedCount >= MINIMUM_APPROVAL) {
            timeOffRequest.setStatus(TimeOffRequestStatus.APPROVED);
            requestRepository.save(timeOffRequest);
        }
    }
}
