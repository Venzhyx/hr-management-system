package com.projek.hr_backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalSettingRequest {
    
    @NotBlank(message = "Module is required")
    private String module;
    
    @NotNull(message = "Minimum approval is required")
    @Min(value = 1, message = "Minimum approval must be at least 1")
    private Integer minimumApproval;
}
