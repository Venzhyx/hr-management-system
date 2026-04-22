package com.projek.hr_backend.service;

import com.projek.hr_backend.dto.AttendanceSettingsRequest;
import com.projek.hr_backend.dto.AttendanceSettingsResponse;
import com.projek.hr_backend.model.AttendanceSettings;
import com.projek.hr_backend.model.ExtraHoursValidation;
import com.projek.hr_backend.repository.AttendanceSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;

@Service
@RequiredArgsConstructor
public class AttendanceSettingsService {
    
    private final AttendanceSettingsRepository repository;
    
    public AttendanceSettingsResponse getSettings() {
        return repository.findFirstByOrderByIdAsc()
                .map(this::mapToResponse)
                .orElse(new AttendanceSettingsResponse(
                    null,
                    0,
                    ExtraHoursValidation.APPROVED_BY_MANAGER,
                    LocalTime.of(8, 0),
                    LocalTime.of(17, 0),
                    null,
                    null
                ));
    }
    
    @Transactional
    public AttendanceSettingsResponse updateSettings(AttendanceSettingsRequest request) {
        AttendanceSettings settings = repository.findFirstByOrderByIdAsc()
                .orElseGet(() -> {
                    AttendanceSettings newSettings = new AttendanceSettings();
                    return repository.save(newSettings);
                });
        
        settings.setToleranceTimeInFavorOfEmployee(request.getToleranceTimeInFavorOfEmployee());
        settings.setExtraHoursValidation(request.getExtraHoursValidation());

        if (request.getCheckInTime() != null) {
            settings.setCheckInTime(request.getCheckInTime());
        }
        if (request.getCheckOutTime() != null) {
            settings.setCheckOutTime(request.getCheckOutTime());
        }
        
        AttendanceSettings saved = repository.save(settings);
        return mapToResponse(saved);
    }
    
    private AttendanceSettingsResponse mapToResponse(AttendanceSettings settings) {
        return new AttendanceSettingsResponse(
            settings.getId(),
            settings.getToleranceTimeInFavorOfEmployee(),
            settings.getExtraHoursValidation(),
            settings.getCheckInTime() != null ? settings.getCheckInTime() : LocalTime.of(8, 0),
            settings.getCheckOutTime() != null ? settings.getCheckOutTime() : LocalTime.of(17, 0),
            settings.getCreatedAt(),
            settings.getUpdatedAt()
        );
    }
}
