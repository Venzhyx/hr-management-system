package com.projek.hr_backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimeOffApprovalRequest {

    @NotNull(message = "Approver ID is required")
    private Long approverId;

    @NotNull(message = "Action is required")
    private String action;

    private String notes;
}
