package com.projek.hr_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalSettingResponse {
    private Long id;
    private String module;
    private Integer minimumApproval;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
