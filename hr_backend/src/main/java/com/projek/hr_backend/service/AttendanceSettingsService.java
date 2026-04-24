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
                    null, null,
                    100.0, 100.0,
                    null, null
                ));
    }
    
    @Transactional
    public AttendanceSettingsResponse updateSettings(AttendanceSettingsRequest request) {
        AttendanceSettings settings = repository.findFirstByOrderByIdAsc()
                .orElseGet(() -> repository.save(new AttendanceSettings()));
        
        settings.setToleranceTimeInFavorOfEmployee(request.getToleranceTimeInFavorOfEmployee());
        settings.setExtraHoursValidation(request.getExtraHoursValidation());

        if (request.getCheckInTime() != null)  settings.setCheckInTime(request.getCheckInTime());
        if (request.getCheckOutTime() != null) settings.setCheckOutTime(request.getCheckOutTime());
        if (request.getOfficeLatitude() != null)  settings.setOfficeLatitude(request.getOfficeLatitude());
        if (request.getOfficeLongitude() != null) settings.setOfficeLongitude(request.getOfficeLongitude());
        if (request.getWfoRadius() != null) settings.setWfoRadius(request.getWfoRadius());
        if (request.getWfhRadius() != null) settings.setWfhRadius(request.getWfhRadius());
        
        return mapToResponse(repository.save(settings));
    }
    
    private AttendanceSettingsResponse mapToResponse(AttendanceSettings s) {
        return new AttendanceSettingsResponse(
            s.getId(),
            s.getToleranceTimeInFavorOfEmployee(),
            s.getExtraHoursValidation(),
            s.getCheckInTime()  != null ? s.getCheckInTime()  : LocalTime.of(8, 0),
            s.getCheckOutTime() != null ? s.getCheckOutTime() : LocalTime.of(17, 0),
            s.getOfficeLatitude(),
            s.getOfficeLongitude(),
            s.getWfoRadius()  != null ? s.getWfoRadius()  : 100.0,
            s.getWfhRadius()  != null ? s.getWfhRadius()  : 100.0,
            s.getCreatedAt(),
            s.getUpdatedAt()
        );
    }
}
