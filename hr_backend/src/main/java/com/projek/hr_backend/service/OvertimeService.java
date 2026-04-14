package com.projek.hr_backend.service;

import com.projek.hr_backend.dto.OvertimeRequest;
import com.projek.hr_backend.dto.OvertimeResponse;
import com.projek.hr_backend.exception.ResourceNotFoundException;
import com.projek.hr_backend.model.ApprovalStatus;
import com.projek.hr_backend.model.Employee;
import com.projek.hr_backend.model.Overtime;
import com.projek.hr_backend.model.OvertimeType;
import com.projek.hr_backend.repository.EmployeeRepository;
import com.projek.hr_backend.repository.OvertimeRepository;
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
    private final EmployeeRepository employeeRepository;

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

        return mapToResponse(overtimeRepository.save(overtime));
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
    public OvertimeResponse approveOvertime(Long id, Long adminId) {
        Overtime overtime = overtimeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Overtime not found"));

        if (!overtime.getStatus().equals(ApprovalStatus.PENDING)) {
            throw new IllegalStateException("Overtime already processed");
        }

        overtime.setStatus(ApprovalStatus.APPROVED);
        overtime.setApprovedBy(adminId);
        overtime.setApprovedAt(LocalDateTime.now());

        return mapToResponse(overtimeRepository.save(overtime));
    }

    @Transactional
    public OvertimeResponse rejectOvertime(Long id, Long adminId) {
        Overtime overtime = overtimeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Overtime not found"));

        if (!overtime.getStatus().equals(ApprovalStatus.PENDING)) {
            throw new IllegalStateException("Overtime already processed");
        }

        overtime.setStatus(ApprovalStatus.REJECTED);
        overtime.setApprovedBy(adminId);
        overtime.setApprovedAt(LocalDateTime.now());

        return mapToResponse(overtimeRepository.save(overtime));
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
        response.setApprovedBy(overtime.getApprovedBy());
        response.setApprovedAt(overtime.getApprovedAt());
        response.setCreatedAt(overtime.getCreatedAt());
        response.setUpdatedAt(overtime.getUpdatedAt());
        return response;
    }
}
