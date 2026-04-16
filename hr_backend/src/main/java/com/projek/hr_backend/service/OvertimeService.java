package com.projek.hr_backend.service;

import com.projek.hr_backend.dto.OvertimeRequest;
import com.projek.hr_backend.dto.OvertimeResponse;
import com.projek.hr_backend.exception.ResourceNotFoundException;
import com.projek.hr_backend.model.*;
import com.projek.hr_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OvertimeService {

    private final OvertimeRepository overtimeRepository;
    private final OvertimeApprovalRepository approvalRepository;
    private final EmployeeRepository employeeRepository;
    private final ApprovalApproverRepository approverRepository;

    @Transactional
    public OvertimeResponse createOvertime(OvertimeRequest request) {
        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new IllegalArgumentException("Start time and end time are required");
        }
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        LocalDate date = request.getStartTime().toLocalDate();
        if (date.isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Date cannot be in the future");
        }

        Duration duration = Duration.between(request.getStartTime(), request.getEndTime());
        double totalHours = duration.toMinutes() / 60.0;

        if (totalHours <= 0) {
            throw new IllegalArgumentException("Total hours must be greater than 0");
        }
        if (totalHours > 24) {
            throw new IllegalArgumentException("Total hours cannot exceed 24 hours");
        }

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        Overtime overtime = new Overtime();
        overtime.setEmployee(employee);
        overtime.setDate(date);
        overtime.setType(OvertimeType.valueOf(request.getType().toUpperCase()));
        overtime.setStartTime(request.getStartTime());
        overtime.setEndTime(request.getEndTime());
        overtime.setTotalHours(totalHours);
        overtime.setDescription(request.getDescription());
        overtime.setStatus(ApprovalStatus.PENDING);

        Overtime saved = overtimeRepository.save(overtime);

        createApprovalRecords(saved);

        return mapToResponse(saved);
    }

    private void createApprovalRecords(Overtime overtime) {
        List<ApprovalApprover> approvers = approverRepository.findAllByOrderByApprovalOrderAsc();

        for (int i = 0; i < approvers.size(); i++) {
            OvertimeApproval approval = new OvertimeApproval();
            approval.setOvertime(overtime);
            approval.setApproverId(approvers.get(i).getEmployee().getId());
            approval.setSequence(i + 1);
            approval.setStatus(ApprovalStatus.PENDING);
            approvalRepository.save(approval);
        }
    }

    public List<OvertimeResponse> getAllOvertimes() {
        return overtimeRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<OvertimeResponse> getOvertimesByEmployee(Long employeeId) {
        return overtimeRepository.findByEmployeeId(employeeId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Double getTotalOvertimeByEmployee(Long employeeId, int month, int year) {
        return overtimeRepository.getTotalApprovedHoursByEmployeeAndMonth(employeeId, month, year);
    }

    @Transactional
    public OvertimeResponse approveOvertime(Long overtimeId, Long approverId) {
        Overtime overtime = overtimeRepository.findById(overtimeId)
                .orElseThrow(() -> new ResourceNotFoundException("Overtime not found"));

        if (!overtime.getStatus().equals(ApprovalStatus.PENDING)) {
            throw new IllegalStateException("Overtime sudah diproses");
        }

        List<OvertimeApproval> approvals =
                approvalRepository.findByOvertimeIdOrderBySequenceAsc(overtimeId);

        OvertimeApproval myApproval = approvals.stream()
                .filter(a -> a.getApproverId().equals(approverId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Approver tidak terdaftar untuk overtime ini"));

        if (!myApproval.getStatus().equals(ApprovalStatus.PENDING)) {
            throw new IllegalStateException("Kamu sudah memproses overtime ini");
        }

        int currentSequence = myApproval.getSequence();
        boolean previousApproved = approvals.stream()
                .filter(a -> a.getSequence() < currentSequence)
                .allMatch(a -> a.getStatus().equals(ApprovalStatus.APPROVED));

        if (!previousApproved) {
            throw new IllegalStateException("Belum giliran kamu untuk approve. Tunggu approver sebelumnya");
        }

        myApproval.setStatus(ApprovalStatus.APPROVED);
        myApproval.setApprovedAt(LocalDateTime.now());
        approvalRepository.save(myApproval);

        System.out.println("[APPROVED] Overtime: " + overtimeId + " by Approver: " + approverId + " Sequence: " + currentSequence);

        boolean allApproved = approvals.stream()
                .filter(a -> !a.getId().equals(myApproval.getId()))
                .allMatch(a -> a.getStatus().equals(ApprovalStatus.APPROVED));

        if (allApproved) {
            overtime.setStatus(ApprovalStatus.APPROVED);
            overtimeRepository.save(overtime);
            System.out.println("[FINAL APPROVED] Overtime: " + overtimeId);
        }

        return mapToResponse(overtime);
    }

    @Transactional
    public OvertimeResponse rejectOvertime(Long overtimeId, Long approverId) {
        Overtime overtime = overtimeRepository.findById(overtimeId)
                .orElseThrow(() -> new ResourceNotFoundException("Overtime not found"));

        if (!overtime.getStatus().equals(ApprovalStatus.PENDING)) {
            throw new IllegalStateException("Overtime sudah diproses");
        }

        List<OvertimeApproval> approvals =
                approvalRepository.findByOvertimeIdOrderBySequenceAsc(overtimeId);

        OvertimeApproval myApproval = approvals.stream()
                .filter(a -> a.getApproverId().equals(approverId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Approver tidak terdaftar untuk overtime ini"));

        if (!myApproval.getStatus().equals(ApprovalStatus.PENDING)) {
            throw new IllegalStateException("Kamu sudah memproses overtime ini");
        }

        int currentSequence = myApproval.getSequence();
        boolean previousApproved = approvals.stream()
                .filter(a -> a.getSequence() < currentSequence)
                .allMatch(a -> a.getStatus().equals(ApprovalStatus.APPROVED));

        if (!previousApproved) {
            throw new IllegalStateException("Belum giliran kamu untuk reject. Tunggu approver sebelumnya");
        }

        myApproval.setStatus(ApprovalStatus.REJECTED);
        myApproval.setApprovedAt(LocalDateTime.now());
        approvalRepository.save(myApproval);

        overtime.setStatus(ApprovalStatus.REJECTED);
        overtimeRepository.save(overtime);

        System.out.println("[REJECTED] Overtime: " + overtimeId + " by Approver: " + approverId);

        return mapToResponse(overtime);
    }

    private OvertimeResponse mapToResponse(Overtime overtime) {
        OvertimeResponse response = new OvertimeResponse();
        response.setId(overtime.getId());
        response.setEmployeeId(overtime.getEmployee().getId());
        response.setEmployeeName(overtime.getEmployee().getName());
        response.setDate(overtime.getDate());
        response.setType(overtime.getType());
        response.setStartTime(overtime.getStartTime());
        response.setEndTime(overtime.getEndTime());
        response.setTotalHours(overtime.getTotalHours());
        response.setDescription(overtime.getDescription());
        response.setStatus(overtime.getStatus());
        response.setCreatedAt(overtime.getCreatedAt());
        response.setUpdatedAt(overtime.getUpdatedAt());

        List<OvertimeApproval> approvals =
                approvalRepository.findByOvertimeIdOrderBySequenceAsc(overtime.getId());

        response.setApprovals(approvals.stream()
                .map(a -> new OvertimeResponse.ApprovalDetail(
                        a.getId(),
                        a.getApproverId(),
                        a.getSequence(),
                        a.getStatus(),
                        a.getNotes(),
                        a.getApprovedAt()
                ))
                .collect(Collectors.toList()));

        return response;
    }
}
