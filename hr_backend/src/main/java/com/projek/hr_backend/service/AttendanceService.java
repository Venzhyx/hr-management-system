package com.projek.hr_backend.service;

import com.projek.hr_backend.dto.AttendanceRequest;
import com.projek.hr_backend.dto.AttendanceResponse;
import com.projek.hr_backend.exception.BadRequestException;
import com.projek.hr_backend.exception.ResourceNotFoundException;
import com.projek.hr_backend.model.Attendance;
import com.projek.hr_backend.model.AttendanceStatus;
import com.projek.hr_backend.model.Employee;
import com.projek.hr_backend.repository.AttendanceRepository;
import com.projek.hr_backend.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {
    
    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    
    @Transactional
    public AttendanceResponse checkIn(AttendanceRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + request.getEmployeeId()));
        
        LocalDate today = LocalDate.now();
        
        if (attendanceRepository.existsByEmployeeIdAndDate(request.getEmployeeId(), today)) {
            throw new BadRequestException("Employee already checked in today");
        }
        
        Attendance attendance = new Attendance();
        attendance.setEmployee(employee);
        attendance.setEmployeeName(employee.getName());
        attendance.setDate(today);
        attendance.setCheckIn(LocalDateTime.now());
        attendance.setStatus(AttendanceStatus.PRESENT);
        
        Attendance savedAttendance = attendanceRepository.save(attendance);
        return mapEntityToResponse(savedAttendance);
    }
    
    @Transactional
    public AttendanceResponse checkOut(AttendanceRequest request) {
        employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + request.getEmployeeId()));
        
        LocalDate today = LocalDate.now();
        
        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(request.getEmployeeId(), today)
                .orElseThrow(() -> new BadRequestException("No check-in record found for today"));
        
        if (attendance.getCheckOut() != null) {
            throw new BadRequestException("Employee already checked out today");
        }
        
        attendance.setCheckOut(LocalDateTime.now());
        
        Attendance updatedAttendance = attendanceRepository.save(attendance);
        return mapEntityToResponse(updatedAttendance);
    }
    
    public List<AttendanceResponse> getAttendanceByEmployee(Long employeeId) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException("Employee not found with id: " + employeeId);
        }
        
        return attendanceRepository.findByEmployeeId(employeeId).stream()
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());
    }
    
    public List<AttendanceResponse> getAllAttendances() {
        return attendanceRepository.findAll().stream()
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());
    }
    
    public List<AttendanceResponse> getFilteredAttendances(String dateFromStr, String dateToStr, Long employeeId) {
        LocalDate dateFrom = dateFromStr != null && !dateFromStr.isEmpty() ? LocalDate.parse(dateFromStr) : null;
        LocalDate dateTo = dateToStr != null && !dateToStr.isEmpty() ? LocalDate.parse(dateToStr) : null;
        
        return attendanceRepository.findByFilters(dateFrom, dateTo, employeeId).stream()
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());
    }
    
    private AttendanceResponse mapEntityToResponse(Attendance attendance) {
        AttendanceResponse response = new AttendanceResponse();
        response.setId(attendance.getId());
        
        if (attendance.getEmployee() != null) {
            response.setEmployeeId(attendance.getEmployee().getId());
            response.setEmployeeName(attendance.getEmployee().getName());
        } else {
            response.setEmployeeId(null);
            response.setEmployeeName(attendance.getEmployeeName() != null ? attendance.getEmployeeName() : "Deleted Employee");
        }
        
        response.setDate(attendance.getDate());
        response.setCheckIn(attendance.getCheckIn());
        response.setCheckOut(attendance.getCheckOut());
        response.setStatus(attendance.getStatus());
        response.setCreatedAt(attendance.getCreatedAt());
        response.setUpdatedAt(attendance.getUpdatedAt());
        return response;
    }
}
