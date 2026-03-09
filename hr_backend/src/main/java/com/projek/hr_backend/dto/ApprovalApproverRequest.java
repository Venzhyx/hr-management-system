package com.projek.hr_backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalApproverRequest {
    
    @NotNull(message = "Approval setting ID is required")
    private Long approvalSettingId;
    
    @NotNull(message = "Employee ID is required")
    private Long employeeId;
    
    private Boolean isRequired = false;
    
    @NotNull(message = "Approval order is required")
    private Integer approvalOrder;
}
