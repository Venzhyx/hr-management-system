package com.projek.hr_backend.dto;

import com.projek.hr_backend.model.ExtraHoursValidation;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceSettingsResponse {
    private Long id;
    private Integer toleranceTimeInFavorOfEmployee;
    private ExtraHoursValidation extraHoursValidation;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
