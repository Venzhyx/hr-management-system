package com.projek.hr_backend.service;

import com.projek.hr_backend.dto.CheckInResponse;
import com.projek.hr_backend.exception.ResourceNotFoundException;
import com.projek.hr_backend.model.*;
import com.projek.hr_backend.repository.AttendanceRepository;
import com.projek.hr_backend.repository.EmployeeSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class CheckInService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeSettingsRepository employeeSettingsRepository;

    private static final String UPLOAD_DIR = "/app/uploads/attendance/";
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    @Transactional
    public CheckInResponse checkIn(Long employeeId, MultipartFile photo,
                                   Double latitude, Double longitude,
                                   String attendanceType) throws IOException {

        // 1. Cari employee via settings
        EmployeeSettings settings = employeeSettingsRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));

        Employee employee = settings.getEmployee();
        if (employee == null) {
            throw new ResourceNotFoundException("Employee data not found");
        }

        // 2. Cek duplikat - tidak boleh check-in 2x di hari yang sama
        LocalDate today = LocalDate.now();
        if (attendanceRepository.existsByEmployeeIdAndDate(employeeId, today)) {
            throw new IllegalStateException("Sudah absen hari ini");
        }

        // 3. Simpan foto
        String photoPath = null;
        if (photo != null && !photo.isEmpty()) {
            photoPath = savePhoto(photo, employeeId);
        }

        // 4. Set waktu check-in
        LocalDateTime checkIn = LocalDateTime.now();

        // 5. Tentukan status
        DayOfWeek day = today.getDayOfWeek();
        String status;
        if (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) {
            status = "OFF";
        } else if (checkIn.toLocalTime().isAfter(LocalTime.of(8, 0))) {
            status = "LATE";
        } else {
            status = "PRESENT";
        }

        // 6. Buat dan simpan attendance
        Attendance attendance = new Attendance();
        attendance.setEmployee(employee);
        attendance.setEmployeeCode(settings.getEmployeeIdentificationNumber());
        attendance.setEmployeeName(employee.getName());
        attendance.setDate(today);
        attendance.setCheckIn(checkIn);
        attendance.setCheckOut(null);
        attendance.setStatus(status);
        attendance.setPhotoPath(photoPath);
        attendance.setLatitude(latitude);
        attendance.setLongitude(longitude);
        attendance.setAttendanceType(AttendanceType.valueOf(attendanceType.toUpperCase()));
        attendance.setSource(AttendanceSource.MANUAL);

        attendanceRepository.save(attendance);

        // 7. Return response
        return new CheckInResponse(
                "SUCCESS",
                employee.getId(),
                employee.getName(),
                checkIn.format(TIME_FORMATTER),
                attendanceType.toUpperCase(),
                latitude,
                longitude,
                status
        );
    }

    private String savePhoto(MultipartFile photo, Long employeeId) throws IOException {
        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        String fileName = System.currentTimeMillis() + "_" + employeeId + ".jpg";
        Path filePath = Paths.get(UPLOAD_DIR + fileName);
        Files.write(filePath, photo.getBytes());

        return UPLOAD_DIR + fileName;
    }
}
