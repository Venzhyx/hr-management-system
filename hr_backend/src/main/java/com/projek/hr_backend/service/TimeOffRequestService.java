package com.projek.hr_backend.service;

import com.projek.hr_backend.dto.TimeOffRequestRequest;
import com.projek.hr_backend.dto.TimeOffRequestResponse;
import com.projek.hr_backend.exception.ResourceNotFoundException;
import com.projek.hr_backend.model.Employee;
import com.projek.hr_backend.model.TimeOffRequest;
import com.projek.hr_backend.model.TimeOffRequestStatus;
import com.projek.hr_backend.model.TimeOffType;
import com.projek.hr_backend.repository.EmployeeRepository;
import com.projek.hr_backend.repository.TimeOffRequestRepository;
import com.projek.hr_backend.repository.TimeOffTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TimeOffRequestService {

    private final TimeOffRequestRepository requestRepository;
    private final EmployeeRepository employeeRepository;
    private final TimeOffTypeRepository timeOffTypeRepository;

    @Transactional
    public TimeOffRequestResponse createRequest(TimeOffRequestRequest request) {
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("End date must be after or equal to start date");
        }

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        TimeOffType timeOffType = timeOffTypeRepository.findById(request.getTimeOffTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Time off type not found"));

        int requestedDays = calculateDays(request.getStartDate(), request.getEndDate());

        TimeOffRequest timeOffRequest = new TimeOffRequest();
        timeOffRequest.setEmployee(employee);
        timeOffRequest.setTimeOffType(timeOffType);
        timeOffRequest.setStartDate(request.getStartDate());
        timeOffRequest.setEndDate(request.getEndDate());
        timeOffRequest.setRequested(requestedDays);
        timeOffRequest.setReason(request.getReason());
        timeOffRequest.setAttachmentUrl(request.getAttachmentUrl());
        timeOffRequest.setAttachmentName(request.getAttachmentName());
        timeOffRequest.setStatus(TimeOffRequestStatus.SUBMITTED);

        TimeOffRequest saved = requestRepository.save(timeOffRequest);
        return mapToResponse(saved);
    }

    public List<TimeOffRequestResponse> getAllRequests() {
        return requestRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public TimeOffRequestResponse getRequestById(Long id) {
        TimeOffRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Time off request not found"));
        return mapToResponse(request);
    }

    public List<TimeOffRequestResponse> getRequestsByEmployeeId(Long employeeId) {
        List<TimeOffRequest> requests = requestRepository.findByEmployeeId(employeeId);
        return requests.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TimeOffRequestResponse updateRequest(Long id, TimeOffRequestRequest request) {
        TimeOffRequest existing = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Time off request not found"));

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("End date must be after or equal to start date");
        }

        TimeOffType timeOffType = timeOffTypeRepository.findById(request.getTimeOffTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Time off type not found"));

        int requestedDays = calculateDays(request.getStartDate(), request.getEndDate());

        existing.setTimeOffType(timeOffType);
        existing.setStartDate(request.getStartDate());
        existing.setEndDate(request.getEndDate());
        existing.setRequested(requestedDays);
        existing.setReason(request.getReason());
        existing.setAttachmentUrl(request.getAttachmentUrl());
        existing.setAttachmentName(request.getAttachmentName());

        TimeOffRequest saved = requestRepository.save(existing);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteRequest(Long id) {
        if (!requestRepository.existsById(id)) {
            throw new ResourceNotFoundException("Time off request not found");
        }
        requestRepository.deleteById(id);
    }

    @Transactional
    public TimeOffRequestResponse approveRequest(Long id) {
        TimeOffRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Time off request not found"));

        if (!request.getStatus().equals(TimeOffRequestStatus.SUBMITTED)) {
            throw new IllegalStateException("Request already processed");
        }

        request.setStatus(TimeOffRequestStatus.APPROVED);
        TimeOffRequest saved = requestRepository.save(request);
        return mapToResponse(saved);
    }

    @Transactional
    public TimeOffRequestResponse rejectRequest(Long id) {
        TimeOffRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Time off request not found"));

        if (!request.getStatus().equals(TimeOffRequestStatus.SUBMITTED)) {
            throw new IllegalStateException("Request already processed");
        }

        request.setStatus(TimeOffRequestStatus.REJECTED);
        TimeOffRequest saved = requestRepository.save(request);
        return mapToResponse(saved);
    }

    private int calculateDays(LocalDate startDate, LocalDate endDate) {
        return (int) ChronoUnit.DAYS.between(startDate, endDate) + 1;
    }

    private TimeOffRequestResponse mapToResponse(TimeOffRequest request) {
        TimeOffRequestResponse response = new TimeOffRequestResponse();
        response.setId(request.getId());
        response.setEmployeeId(request.getEmployee().getId());
        response.setEmployeeName(request.getEmployee().getName());
        response.setTimeOffTypeId(request.getTimeOffType().getId());
        response.setTimeOffTypeName(request.getTimeOffType().getName());
        response.setStartDate(request.getStartDate());
        response.setEndDate(request.getEndDate());
        response.setRequested(request.getRequested());
        response.setReason(request.getReason());
        response.setAttachmentUrl(request.getAttachmentUrl());
        response.setAttachmentName(request.getAttachmentName());
        response.setStatus(request.getStatus());
        response.setCreatedAt(request.getCreatedAt());
        response.setUpdatedAt(request.getUpdatedAt());
        return response;
    }
}
