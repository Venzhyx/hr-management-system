package com.projek.hr_backend.service;

import com.projek.hr_backend.dto.AttendanceCorrectionRequest;
import com.projek.hr_backend.dto.AttendanceCorrectionResponse;
import com.projek.hr_backend.exception.ResourceNotFoundException;
import com.projek.hr_backend.model.Attendance;
import com.projek.hr_backend.model.AttendanceCorrection;
import com.projek.hr_backend.model.Employee;
import com.projek.hr_backend.repository.AttendanceCorrectionRepository;
import com.projek.hr_backend.repository.AttendanceRepository;
import com.projek.hr_backend.repository.EmployeeRepository;
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
    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

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
        System.out.println("[CORRECTION CREATED] Employee: " + request.getEmployeeId() + " Date: " + request.getDate());

        return mapToResponse(saved);
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
    public AttendanceCorrectionResponse approveCorrection(Long id, Long adminId) {
        AttendanceCorrection correction = correctionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Correction not found"));

        if (!correction.getStatus().equals("PENDING")) {
            throw new IllegalStateException("Correction sudah diproses");
        }

        Attendance attendance = attendanceRepository
                .findByEmployeeIdAndDate(correction.getEmployee().getId(), correction.getDate())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Attendance tidak ditemukan untuk tanggal: " + correction.getDate()));

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
        correction.setApprovedBy(adminId);
        correction.setApprovedAt(LocalDateTime.now());
        AttendanceCorrection saved = correctionRepository.save(correction);

        System.out.println("[APPROVED] Employee: " + correction.getEmployee().getId() + " Date: " + correction.getDate());

        return mapToResponse(saved);
    }

    @Transactional
    public AttendanceCorrectionResponse rejectCorrection(Long id, Long adminId) {
        AttendanceCorrection correction = correctionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Correction not found"));

        if (!correction.getStatus().equals("PENDING")) {
            throw new IllegalStateException("Correction sudah diproses");
        }

        correction.setStatus("REJECTED");
        correction.setApprovedBy(adminId);
        correction.setApprovedAt(LocalDateTime.now());
        AttendanceCorrection saved = correctionRepository.save(correction);

        System.out.println("[REJECTED] Employee: " + correction.getEmployee().getId() + " Date: " + correction.getDate());

        return mapToResponse(saved);
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
        response.setApprovedBy(correction.getApprovedBy());
        response.setApprovedAt(correction.getApprovedAt());
        response.setCreatedAt(correction.getCreatedAt());
        response.setUpdatedAt(correction.getUpdatedAt());
        return response;
    }
}
