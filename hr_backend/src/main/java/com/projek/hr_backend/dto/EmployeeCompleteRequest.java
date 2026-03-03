package com.projek.hr_backend.dto;

import com.projek.hr_backend.model.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeCompleteRequest {
    
    // Employee Basic Info
    @NotBlank(message = "Employee code is required")
    private String employeeCode;
    
    @NotBlank(message = "Name is required")
    private String name;
    
    private String jobTitle;
    private String jobPosition;
    private String workEmail;
    private String workPhone;
    private String workMobile;
    
    @NotNull(message = "Employee type is required")
    private EmployeeType employeeType;
    
    @NotNull(message = "Status is required")
    private EmployeeStatus status;
    
    @NotNull(message = "Join date is required")
    private LocalDate joinDate;
    
    private String photo;
    private String contractDocument;
    private Double monthlyCost;
    private String relatedUser;
    private Long departmentId;
    private Long managerId;
    private Long coachId;
    
    // Private Contact
    private String privateAddress;
    private String privateEmail;
    private String privatePhone;
    private String bankName;
    private String accountNumber;
    private Double homeToWorkDistance;
    private String bpjsId;
    private String bankBookDocument;
    private String bpjsCardDocument;
    
    // Citizenship
    private String nationality;
    private String identificationNumber;
    private String passportNumber;
    private Gender gender;
    private LocalDate dateOfBirth;
    private String placeOfBirth;
    private String countryOfBirth;
    private String ktpDocument;
    private String passportDocument;
    private String familyCardDocument;
    
    // Emergency
    private String emergencyContactName;
    private String emergencyContactPhone;
    
    // Education
    private CertificateLevel certificateLevel;
    private String fieldOfStudy;
    private String school;
    private String certificateDocument;
    private String transcriptDocument;
    
    // Family Status
    private MaritalStatus maritalStatus;
    private Integer numberOfDependentChildren;
    private String marriageCertificateDocument;
    private String childCertificateDocument;
}
