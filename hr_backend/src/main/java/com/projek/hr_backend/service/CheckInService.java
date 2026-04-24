package com.projek.hr_backend.service;

import com.projek.hr_backend.dto.CheckInResponse;
import com.projek.hr_backend.dto.CheckOutResponse;
import com.projek.hr_backend.dto.LocationValidationResponse;
import com.projek.hr_backend.exception.ResourceNotFoundException;
import com.projek.hr_backend.model.*;
import com.projek.hr_backend.repository.AttendanceRepository;
import com.projek.hr_backend.repository.AttendanceSettingsRepository;
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
    private final AttendanceSettingsRepository attendanceSettingsRepository;
    private final LocationValidationService locationValidationService;

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

        // 2. Cek duplikat
        LocalDate today = LocalDate.now();
        if (attendanceRepository.existsByEmployeeIdAndDate(employeeId, today)) {
            throw new IllegalStateException("Sudah absen hari ini");
        }

        // 3. Validasi lokasi GPS
        AttendanceType type = AttendanceType.valueOf(attendanceType.toUpperCase());
        LocationValidationResponse locationResult = locationValidationService
                .validateLocation(employee, latitude, longitude, type);

        if (!locationResult.isValid()) {
            throw new IllegalStateException(locationResult.getMessage());
        }

        // 4. Simpan foto
        String photoPath = null;
        if (photo != null && !photo.isEmpty()) {
            photoPath = savePhoto(photo, employeeId, "checkin");
        }

        // 5. Set waktu check-in
        LocalDateTime checkIn = LocalDateTime.now();

        // 6. Tentukan status dengan checkInTime dan toleransi dari AttendanceSettings
        DayOfWeek day = today.getDayOfWeek();
        String status;
        if (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) {
            status = "OFF";
        } else {
            AttendanceSettings attSettings = attendanceSettingsRepository
                    .findFirstByOrderByIdAsc().orElse(null);

            LocalTime baseCheckIn = (attSettings != null && attSettings.getCheckInTime() != null)
                    ? attSettings.getCheckInTime()
                    : LocalTime.of(8, 0);

            int toleranceMinutes = (attSettings != null && attSettings.getToleranceTimeInFavorOfEmployee() != null)
                    ? attSettings.getToleranceTimeInFavorOfEmployee()
                    : 0;

            LocalTime deadline = baseCheckIn.plusMinutes(toleranceMinutes);

            if (checkIn.toLocalTime().isAfter(deadline)) {
                status = "LATE";
            } else {
                status = "PRESENT";
            }
        }

        // 7. Simpan attendance
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
        attendance.setAttendanceType(type);
        attendance.setSource(AttendanceSource.MANUAL);
        attendance.setIsLocationValidated(locationResult.isValid());

        attendanceRepository.save(attendance);

        // 8. Return response
        CheckInResponse response = new CheckInResponse();
        response.setStatus("SUCCESS");
        response.setEmployeeId(employee.getId());
        response.setEmployeeName(employee.getName());
        response.setCheckInTime(checkIn.format(TIME_FORMATTER));
        response.setAttendanceType(attendanceType.toUpperCase());
        response.setLatitude(latitude);
        response.setLongitude(longitude);
        response.setAttendanceStatus(status);
        response.setIsLocationValidated(locationResult.isValid());
        response.setDistance(locationResult.getDistance());
        response.setRadius(locationResult.getRadius());
        response.setLocationMessage(locationResult.getMessage());

        return response;
    }

    @Transactional
    public CheckOutResponse checkOut(Long employeeId, MultipartFile photo,
                                     Double latitude, Double longitude) throws IOException {

        // 1. Cari employee
        EmployeeSettings settings = employeeSettingsRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));

        Employee employee = settings.getEmployee();
        if (employee == null) {
            throw new ResourceNotFoundException("Employee data not found");
        }

        // 2. Cari attendance hari ini
        LocalDate today = LocalDate.now();
        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employeeId, today)
                .orElseThrow(() -> new IllegalStateException("Belum melakukan check-in hari ini"));

        // 3. Validasi belum checkout
        if (attendance.getCheckOut() != null) {
            throw new IllegalStateException("Sudah melakukan check-out hari ini");
        }

        // 4. Simpan foto checkout
        String photoPath = null;
        if (photo != null && !photo.isEmpty()) {
            photoPath = savePhoto(photo, employeeId, "checkout");
        }

        // 5. Set waktu checkout
        LocalDateTime checkOut = LocalDateTime.now();

        // 6. Ambil checkOutTime dari settings
        AttendanceSettings attSettings = attendanceSettingsRepository
                .findFirstByOrderByIdAsc().orElse(null);

        LocalTime expectedCheckOut = (attSettings != null && attSettings.getCheckOutTime() != null)
                ? attSettings.getCheckOutTime()
                : LocalTime.of(17, 0);

        String message = checkOut.toLocalTime().isBefore(expectedCheckOut)
                ? "Checkout lebih awal dari jam kerja (" + expectedCheckOut + ")"
                : "Checkout berhasil";

        // 7. Update attendance
        attendance.setCheckOut(checkOut);
        if (photoPath != null) attendance.setCheckOutPhotoPath(photoPath);
        if (latitude != null)  attendance.setCheckOutLatitude(latitude);
        if (longitude != null) attendance.setCheckOutLongitude(longitude);
        attendanceRepository.save(attendance);

        return new CheckOutResponse(
                "SUCCESS",
                employee.getId(),
                employee.getName(),
                checkOut.format(TIME_FORMATTER),
                attendance.getStatus(),
                message
        );
    }

    private String savePhoto(MultipartFile photo, Long employeeId, String type) throws IOException {
        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }
        String fileName = System.currentTimeMillis() + "_" + employeeId + "_" + type + ".jpg";
        Path filePath = Paths.get(UPLOAD_DIR + fileName);
        Files.write(filePath, photo.getBytes());
        return UPLOAD_DIR + fileName;
    }
}
