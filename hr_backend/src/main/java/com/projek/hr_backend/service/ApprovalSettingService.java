package com.projek.hr_backend.service;

import com.projek.hr_backend.dto.ApprovalSettingRequest;
import com.projek.hr_backend.dto.ApprovalSettingResponse;
import com.projek.hr_backend.exception.ResourceNotFoundException;
import com.projek.hr_backend.model.ApprovalSetting;
import com.projek.hr_backend.repository.ApprovalSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApprovalSettingService {
    
    private final ApprovalSettingRepository repository;
    
    public List<ApprovalSettingResponse> getAllSettings() {
        return repository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public ApprovalSettingResponse createSetting(ApprovalSettingRequest request) {
        ApprovalSetting setting = new ApprovalSetting();
        setting.setModule(request.getModule());
        setting.setMinimumApproval(request.getMinimumApproval());
        
        ApprovalSetting saved = repository.save(setting);
        return mapToResponse(saved);
    }
    
    @Transactional
    public ApprovalSettingResponse updateSetting(Long id, ApprovalSettingRequest request) {
        ApprovalSetting setting = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Approval setting not found"));
        
        setting.setModule(request.getModule());
        setting.setMinimumApproval(request.getMinimumApproval());
        
        ApprovalSetting saved = repository.save(setting);
        return mapToResponse(saved);
    }
    
    private ApprovalSettingResponse mapToResponse(ApprovalSetting setting) {
        return new ApprovalSettingResponse(
            setting.getId(),
            setting.getModule(),
            setting.getMinimumApproval(),
            setting.getCreatedAt(),
            setting.getUpdatedAt()
        );
    }
}
