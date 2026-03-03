package com.projek.hr_backend.dto;

import com.projek.hr_backend.model.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeRequest {
    
    // Employee Basic Info
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotBlank(message = "Job title is required")
    private String jobTitle;
    
    private String workMobile;
    
    @NotBlank(message = "Work phone is required")
    private String workPhone;
    
    @NotBlank(message = "Work email is required")
    @Email(message = "Invalid email format")
    private String workEmail;
    
    @NotNull(message = "Join date is required")
    private LocalDate joinDate;
    
    private String photo;
    
    @NotNull(message = "Company is required")
    private Long companyId;
    
    @NotNull(message = "Department is required")
    private Long departmentId;
    private Long managerId;
    private Long coachId;
    
    // Private Contact
    private String privateAddress;
    private String privateEmail;
    private String privatePhone;
    private String bankName;
    private String accountNumber;
    private Integer bankId;
    private String assurance;
    private String assuranceId;
    private String npwpId;
    private Double homeToWorkDistance;
    
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
