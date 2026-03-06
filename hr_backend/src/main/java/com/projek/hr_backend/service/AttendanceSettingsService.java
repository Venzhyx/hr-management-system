package com.projek.hr_backend.service;

import com.projek.hr_backend.dto.AttendanceSettingsRequest;
import com.projek.hr_backend.dto.AttendanceSettingsResponse;
import com.projek.hr_backend.exception.ResourceNotFoundException;
import com.projek.hr_backend.model.AttendanceSettings;
import com.projek.hr_backend.repository.AttendanceSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AttendanceSettingsService {
    
    private final AttendanceSettingsRepository repository;
    
    public AttendanceSettingsResponse getSettings() {
        AttendanceSettings settings = repository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new ResourceNotFoundException("Attendance settings not found"));
        return mapToResponse(settings);
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
        
        AttendanceSettings saved = repository.save(settings);
        return mapToResponse(saved);
    }
    
    private AttendanceSettingsResponse mapToResponse(AttendanceSettings settings) {
        return new AttendanceSettingsResponse(
            settings.getId(),
            settings.getToleranceTimeInFavorOfEmployee(),
            settings.getExtraHoursValidation(),
            settings.getCreatedAt(),
            settings.getUpdatedAt()
        );
    }
}
