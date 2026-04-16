package com.projek.hr_backend.service;

import com.projek.hr_backend.dto.AttendanceCorrectionRequest;
import com.projek.hr_backend.dto.AttendanceCorrectionResponse;
import com.projek.hr_backend.exception.ResourceNotFoundException;
import com.projek.hr_backend.model.*;
import com.projek.hr_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceCorrectionService {

    private final AttendanceCorrectionRepository correctionRepository;
    private final AttendanceCorrectionApprovalRepository approvalRepository;
    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final ApprovalApproverRepository approverRepository;

    @Transactional
    public AttendanceCorrectionResponse createCorrection(AttendanceCorrectionRequest request) {
        validateRequest(request);

        if (request.getDate().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Date cannot be in the future");
        }

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        attendanceRepository.findByEmployeeIdAndDate(request.getEmployeeId(), request.getDate())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Attendance not found for date: " + request.getDate()));

        AttendanceCorrection correction = new AttendanceCorrection();
        correction.setEmployee(employee);
        correction.setDate(request.getDate());
        correction.setNewCheckIn(request.getNewCheckIn());
        correction.setNewCheckOut(request.getNewCheckOut());
        correction.setType(request.getType().toUpperCase());
        correction.setDescription(request.getDescription());
        correction.setStatus("PENDING");

        AttendanceCorrection saved = correctionRepository.save(correction);

        createApprovalRecords(saved);

        System.out.println("[CORRECTION CREATED] Employee: " + request.getEmployeeId() + " Date: " + request.getDate());

        return mapToResponse(saved);
    }

    private void createApprovalRecords(AttendanceCorrection correction) {
        List<ApprovalApprover> approvers = approverRepository.findAllByOrderByApprovalOrderAsc();

        for (int i = 0; i < approvers.size(); i++) {
            AttendanceCorrectionApproval approval = new AttendanceCorrectionApproval();
            approval.setCorrection(correction);
            approval.setApproverId(approvers.get(i).getEmployee().getId());
            approval.setSequence(i + 1);
            approval.setStatus(ApprovalStatus.PENDING);
            approvalRepository.save(approval);
        }
    }

    public List<AttendanceCorrectionResponse> getAllCorrections() {
        return correctionRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<AttendanceCorrectionResponse> getCorrectionsByEmployee(Long employeeId) {
        return correctionRepository.findByEmployeeId(employeeId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AttendanceCorrectionResponse approveCorrection(Long correctionId, Long approverId) {
        AttendanceCorrection correction = correctionRepository.findById(correctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Correction not found"));

        if (!correction.getStatus().equals("PENDING")) {
            throw new IllegalStateException("Correction sudah diproses");
        }

        List<AttendanceCorrectionApproval> approvals =
                approvalRepository.findByCorrectionIdOrderBySequenceAsc(correctionId);

        // Cari approval milik approver ini
        AttendanceCorrectionApproval myApproval = approvals.stream()
                .filter(a -> a.getApproverId().equals(approverId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Approver tidak terdaftar untuk correction ini"));

        if (!myApproval.getStatus().equals(ApprovalStatus.PENDING)) {
            throw new IllegalStateException("Kamu sudah memproses correction ini");
        }

        // Validasi urutan: hanya boleh approve jika semua sequence sebelumnya sudah APPROVED
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

        System.out.println("[APPROVED] Correction: " + correctionId + " by Approver: " + approverId + " Sequence: " + currentSequence);

        // Cek apakah semua approval sudah APPROVED
        boolean allApproved = approvals.stream()
                .filter(a -> !a.getId().equals(myApproval.getId()))
                .allMatch(a -> a.getStatus().equals(ApprovalStatus.APPROVED));

        if (allApproved) {
            // Update attendance
            Attendance attendance = attendanceRepository
                    .findByEmployeeIdAndDate(correction.getEmployee().getId(), correction.getDate())
                    .orElseThrow(() -> new ResourceNotFoundException("Attendance tidak ditemukan"));

            String type = correction.getType();
            if (type.equals("CHECKIN") || type.equals("BOTH")) {
                attendance.setCheckIn(correction.getNewCheckIn());
            }
            if (type.equals("CHECKOUT") || type.equals("BOTH")) {
                attendance.setCheckOut(correction.getNewCheckOut());
            }

            attendance.setStatus(determineStatus(attendance));
            attendanceRepository.save(attendance);

            correction.setStatus("APPROVED");
            correctionRepository.save(correction);

            System.out.println("[FINAL APPROVED] Correction: " + correctionId + " - Attendance updated");
        }

        return mapToResponse(correction);
    }

    @Transactional
    public AttendanceCorrectionResponse rejectCorrection(Long correctionId, Long approverId) {
        AttendanceCorrection correction = correctionRepository.findById(correctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Correction not found"));

        if (!correction.getStatus().equals("PENDING")) {
            throw new IllegalStateException("Correction sudah diproses");
        }

        List<AttendanceCorrectionApproval> approvals =
                approvalRepository.findByCorrectionIdOrderBySequenceAsc(correctionId);

        AttendanceCorrectionApproval myApproval = approvals.stream()
                .filter(a -> a.getApproverId().equals(approverId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Approver tidak terdaftar untuk correction ini"));

        if (!myApproval.getStatus().equals(ApprovalStatus.PENDING)) {
            throw new IllegalStateException("Kamu sudah memproses correction ini");
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

        correction.setStatus("REJECTED");
        correctionRepository.save(correction);

        System.out.println("[REJECTED] Correction: " + correctionId + " by Approver: " + approverId);

        return mapToResponse(correction);
    }

    private String determineStatus(Attendance attendance) {
        DayOfWeek day = attendance.getDate().getDayOfWeek();
        if (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) return "OFF";
        if (attendance.getCheckIn() == null) return "ABSENT";
        if (attendance.getCheckIn().toLocalTime().isAfter(LocalTime.of(8, 0))) return "LATE";
        return "PRESENT";
    }

    private void validateRequest(AttendanceCorrectionRequest request) {
        String type = request.getType().toUpperCase();
        if (type.equals("CHECKIN") && request.getNewCheckIn() == null) {
            throw new IllegalArgumentException("newCheckIn is required for type CHECKIN");
        }
        if (type.equals("CHECKOUT") && request.getNewCheckOut() == null) {
            throw new IllegalArgumentException("newCheckOut is required for type CHECKOUT");
        }
        if (type.equals("BOTH") && (request.getNewCheckIn() == null || request.getNewCheckOut() == null)) {
            throw new IllegalArgumentException("newCheckIn and newCheckOut are required for type BOTH");
        }
    }

    private AttendanceCorrectionResponse mapToResponse(AttendanceCorrection correction) {
        AttendanceCorrectionResponse response = new AttendanceCorrectionResponse();
        response.setId(correction.getId());
        response.setEmployeeId(correction.getEmployee().getId());
        response.setEmployeeName(correction.getEmployee().getName());
        response.setDate(correction.getDate());
        response.setNewCheckIn(correction.getNewCheckIn());
        response.setNewCheckOut(correction.getNewCheckOut());
        response.setType(correction.getType());
        response.setDescription(correction.getDescription());
        response.setStatus(correction.getStatus());
        response.setCreatedAt(correction.getCreatedAt());
        response.setUpdatedAt(correction.getUpdatedAt());

        List<AttendanceCorrectionApproval> approvals =
                approvalRepository.findByCorrectionIdOrderBySequenceAsc(correction.getId());

        response.setApprovals(approvals.stream()
                .map(a -> new AttendanceCorrectionResponse.ApprovalDetail(
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
