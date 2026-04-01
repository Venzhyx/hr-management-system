package com.projek.hr_backend.service;

import com.projek.hr_backend.exception.ResourceNotFoundException;
import com.projek.hr_backend.model.Attendance;
import com.projek.hr_backend.model.Employee;
import com.projek.hr_backend.model.EmployeeSettings;
import com.projek.hr_backend.repository.AttendanceRepository;
import com.projek.hr_backend.repository.EmployeeSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeSettingsRepository employeeSettingsRepository;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Transactional
    public void importExcel(MultipartFile file) throws IOException {
        try (XSSFWorkbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                Cell identificationCell = row.getCell(0);
                Cell checkInCell        = row.getCell(1);
                Cell checkOutCell       = row.getCell(2);

                if (identificationCell == null || checkInCell == null) continue;

                String employeeIdentificationNumber = identificationCell.getStringCellValue().trim();
                if (employeeIdentificationNumber.isEmpty()) continue;

                EmployeeSettings settings = employeeSettingsRepository
                        .findByEmployeeIdentificationNumber(employeeIdentificationNumber)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Employee not found with identification number: " + employeeIdentificationNumber));

                Employee employee = settings.getEmployee();

                LocalDateTime checkIn = LocalDateTime.parse(checkInCell.getStringCellValue().trim(), FORMATTER);
                LocalDateTime checkOut = (checkOutCell != null && !checkOutCell.getStringCellValue().trim().isEmpty())
                        ? LocalDateTime.parse(checkOutCell.getStringCellValue().trim(), FORMATTER)
                        : null;

                String status = (checkIn.getHour() > 8 || (checkIn.getHour() == 8 && checkIn.getMinute() > 0))
                        ? "LATE"
                        : "PRESENT";

                Attendance attendance = new Attendance();
                attendance.setEmployee(employee);
                attendance.setWorkDate(checkIn.toLocalDate());
                attendance.setCheckIn(checkIn);
                attendance.setCheckOut(checkOut);
                attendance.setStatus(status);

                attendanceRepository.save(attendance);
            }
        }
    }

    public List<Attendance> getAllAttendances() {
        return attendanceRepository.findAll();
    }

    public List<Attendance> getAttendancesByEmployee(Long employeeId) {
        return attendanceRepository.findByEmployeeId(employeeId);
    }
}
