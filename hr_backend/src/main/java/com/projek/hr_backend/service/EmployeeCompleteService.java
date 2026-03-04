    package com.projek.hr_backend.service;

    import com.projek.hr_backend.dto.EmployeeCompleteRequest;
    import com.projek.hr_backend.dto.EmployeeCompleteResponse;
    import com.projek.hr_backend.exception.ResourceNotFoundException;
    import com.projek.hr_backend.model.*;
    import com.projek.hr_backend.repository.*;
    import lombok.RequiredArgsConstructor;
    import org.springframework.stereotype.Service;
    import org.springframework.transaction.annotation.Transactional;

    import java.util.List;
    import java.util.stream.Collectors;

    @Service
    @RequiredArgsConstructor
    public class EmployeeCompleteService {
        
        private final EmployeeRepository employeeRepository;
        private final CompanyRepository companyRepository;
        private final DepartmentRepository departmentRepository;
        private final EmployeePrivateInfoRepository privateInfoRepository;
        private final EmployeeCitizenshipRepository citizenshipRepository;
        private final EmployeeEmergencyRepository emergencyRepository;
        private final EmployeeEducationRepository educationRepository;
        private final EmployeeFamilyStatusRepository familyStatusRepository;
        private final EmployeeDocumentRepository documentRepository;
        private final EmployeeSettingsRepository settingsRepository;
        private final AttendanceRepository attendanceRepository;
        
        @Transactional
        public EmployeeCompleteResponse createEmployee(EmployeeCompleteRequest request) {
            // Create Employee
            Employee employee = new Employee();
            mapBasicInfo(request, employee);
            Employee savedEmployee = employeeRepository.save(employee);
            
            // Create Private Info
            if (hasPrivateInfo(request)) {
                EmployeePrivateInfo privateInfo = new EmployeePrivateInfo();
                privateInfo.setEmployee(savedEmployee);
                privateInfo.setPrivateAddress(request.getPrivateAddress());
                privateInfo.setPrivateEmail(request.getPrivateEmail());
                privateInfo.setPrivatePhone(request.getPrivatePhone());
                privateInfo.setBank(request.getBankName());
                privateInfo.setBankAccount(request.getAccountNumber());
                privateInfo.setBankId(request.getBankId());
                privateInfo.setAssurance(request.getAssurance());
                privateInfo.setAssuranceId(request.getAssuranceId());
                privateInfo.setNpwpId(request.getNpwpId());
                privateInfo.setHomeWorkDistance(request.getHomeToWorkDistance());
                privateInfoRepository.save(privateInfo);
            }
            
            // Create Citizenship
            if (hasCitizenship(request)) {
                EmployeeCitizenship citizenship = new EmployeeCitizenship();
                citizenship.setEmployee(savedEmployee);
                citizenship.setNationality(request.getNationality());
                citizenship.setIdentificationNo(request.getIdentificationNumber());
                citizenship.setPassportNo(request.getPassportNumber());
                citizenship.setGender(request.getGender());
                citizenship.setDateOfBirth(request.getDateOfBirth());
                citizenship.setPlaceOfBirth(request.getPlaceOfBirth());
                citizenship.setCountryOfBirth(request.getCountryOfBirth());
                citizenship.setFamilyCardNo(request.getFamilyCardDocument());
                citizenshipRepository.save(citizenship);
            }
            
            // Create Emergency
            if (hasEmergency(request)) {
                EmployeeEmergency emergency = new EmployeeEmergency();
                emergency.setEmployee(savedEmployee);
                emergency.setContactName(request.getEmergencyContactName());
                emergency.setContactPhone(request.getEmergencyContactPhone());
                emergencyRepository.save(emergency);
            }
            
            // Create Education
            if (hasEducation(request)) {
                EmployeeEducation education = new EmployeeEducation();
                education.setEmployee(savedEmployee);
                education.setCertificateLevel(request.getCertificateLevel());
                education.setFieldOfStudy(request.getFieldOfStudy());
                education.setSchool(request.getSchool());
                educationRepository.save(education);
            }
            
            // Create Family Status
            if (hasFamilyStatus(request)) {
                EmployeeFamilyStatus familyStatus = new EmployeeFamilyStatus();
                familyStatus.setEmployee(savedEmployee);
                familyStatus.setMaritalStatus(request.getMaritalStatus());
                familyStatus.setNumberOfDependentChildren(request.getNumberOfDependentChildren());
                familyStatusRepository.save(familyStatus);
            }
            
            // Create Documents
            if (hasDocuments(request)) {
                EmployeeDocument document = new EmployeeDocument();
                document.setEmployee(savedEmployee);
                document.setIdCardCopy(request.getIdCardCopy());
                document.setFamilyCardCopy(request.getFamilyCardCopy());
                document.setDrivingLicenseCopy(request.getDrivingLicenseCopy());
                document.setAssuranceCardCopy(request.getAssuranceCardCopy());
                document.setNpwpCardCopy(request.getNpwpCardCopy());
                documentRepository.save(document);
            }
            
            // Create Settings
            if (hasSettings(request)) {
                EmployeeSettings settings = new EmployeeSettings();
                settings.setEmployee(savedEmployee);
                settings.setStatus(request.getStatus());
                settings.setEmployeeType(request.getEmployeeType());
                settings.setRelatedUser(request.getRelatedUser());
                settings.setMonthlyCost(request.getMonthlyCost());
                settings.setAttendanceBadgeId(request.getAttendanceBadgeId());
                settingsRepository.save(settings);
            }
            
            return getEmployee(savedEmployee.getId());
        }
        
        public EmployeeCompleteResponse getEmployee(Long id) {
            Employee employee = employeeRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
            
            return mapToCompleteResponse(employee);
        }
        
        public List<EmployeeCompleteResponse> getAllEmployees() {
            return employeeRepository.findAll().stream()
                    .map(this::mapToCompleteResponse)
                    .collect(Collectors.toList());
        }
        
        @Transactional
        public EmployeeCompleteResponse updateEmployee(Long id, EmployeeCompleteRequest request) {
            Employee employee = employeeRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        mapBasicInfo(request, employee);
        employeeRepository.save(employee);

        updatePrivateInfo(employee, request);
        updateCitizenship(employee, request);
        updateEmergency(employee, request);
        updateEducation(employee, request);
        updateFamilyStatus(employee, request);
        updateDocuments(employee, request);
        updateSettings(employee, request);

        return getEmployee(id);
    }
        
        @Transactional
        public void deleteEmployee(Long id) {
            if (!employeeRepository.existsById(id)) {
                throw new ResourceNotFoundException("Employee not found with id: " + id);
            }
            
            // Check if employee is referenced by other employees as manager
            long managedEmployees = employeeRepository.countByManagerId(id);
            if (managedEmployees > 0) {
                throw new IllegalStateException("Cannot delete employee. This employee is a manager for " + managedEmployees + " employee(s).");
            }
            
            // Check if employee is referenced by other employees as coach
            long coachedEmployees = employeeRepository.countByCoachId(id);
            if (coachedEmployees > 0) {
                throw new IllegalStateException("Cannot delete employee. This employee is a coach for " + coachedEmployees + " employee(s).");
            }
            
            // Check if employee is a department manager
            long managedDepartments = employeeRepository.countDepartmentsByManagerId(id);
            if (managedDepartments > 0) {
                throw new IllegalStateException("Cannot delete employee. This employee is a manager for " + managedDepartments + " department(s).");
            }
            
            // Set attendance employee_id to null instead of deleting
            attendanceRepository.setEmployeeIdToNull(id);
            
            documentRepository.deleteByEmployeeId(id);
            settingsRepository.deleteByEmployeeId(id);
            citizenshipRepository.deleteByEmployeeId(id);
            emergencyRepository.deleteByEmployeeId(id);
            educationRepository.deleteByEmployeeId(id);
            familyStatusRepository.deleteByEmployeeId(id);
            privateInfoRepository.deleteByEmployeeId(id);
            employeeRepository.deleteById(id);
        }
        
        private void mapBasicInfo(EmployeeCompleteRequest request, Employee employee) {
            employee.setName(request.getName());
            employee.setJobTitle(request.getJobTitle());
            employee.setWorkEmail(request.getWorkEmail());
            employee.setWorkPhone(request.getWorkPhone());
            employee.setWorkMobile(request.getWorkMobile());
            employee.setJoinDate(request.getJoinDate());

            if (request.getPhoto() != null) {
                employee.setPhoto(request.getPhoto());
            }

        if (request.getCompanyId() != null) {
            Company company = companyRepository.findById(request.getCompanyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
            employee.setCompany(company);
        }

        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
            employee.setDepartment(department);
        }

        if (request.getManagerId() != null) {
            Employee manager = employeeRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));
            employee.setManager(manager);
        }

        if (request.getCoachId() != null) {
            Employee coach = employeeRepository.findById(request.getCoachId())
                    .orElseThrow(() -> new ResourceNotFoundException("Coach not found"));
            employee.setCoach(coach);
        }
    }
        
        private EmployeeCompleteResponse mapToCompleteResponse(Employee employee) {
            EmployeeCompleteResponse response = new EmployeeCompleteResponse();
            
            // Basic Info
            response.setId(employee.getId());
            response.setName(employee.getName());
            response.setJobTitle(employee.getJobTitle());
            response.setWorkEmail(employee.getWorkEmail());
            response.setWorkPhone(employee.getWorkPhone());
            response.setWorkMobile(employee.getWorkMobile());
            response.setJoinDate(employee.getJoinDate());
            response.setPhoto(employee.getPhoto());
            response.setCreatedAt(employee.getCreatedAt());
            response.setUpdatedAt(employee.getUpdatedAt());
            
            if (employee.getCompany() != null) {
                response.setCompanyId(employee.getCompany().getId());
                response.setCompanyName(employee.getCompany().getCompanyName());
            }
            
            if (employee.getDepartment() != null) {
                response.setDepartmentId(employee.getDepartment().getId());
                response.setDepartmentName(employee.getDepartment().getDepartmentName());
            }
            
            if (employee.getManager() != null) {
                response.setManagerId(employee.getManager().getId());
                response.setManagerName(employee.getManager().getName());
            }
            
            if (employee.getCoach() != null) {
                response.setCoachId(employee.getCoach().getId());
                response.setCoachName(employee.getCoach().getName());
            }
            
            // Private Info
            privateInfoRepository.findByEmployeeId(employee.getId()).ifPresent(info -> {
                response.setPrivateAddress(info.getPrivateAddress());
                response.setPrivateEmail(info.getPrivateEmail());
                response.setPrivatePhone(info.getPrivatePhone());
                response.setBankName(info.getBank());
                response.setAccountNumber(info.getBankAccount());
                response.setBankId(info.getBankId());
                response.setAssurance(info.getAssurance());
                response.setAssuranceId(info.getAssuranceId());
                response.setNpwpId(info.getNpwpId());
                response.setHomeToWorkDistance(info.getHomeWorkDistance());
            });
            
            // Citizenship
            citizenshipRepository.findByEmployeeId(employee.getId()).ifPresent(citizenship -> {
                response.setNationality(citizenship.getNationality());
                response.setIdentificationNumber(citizenship.getIdentificationNo());
                response.setPassportNumber(citizenship.getPassportNo());
                response.setGender(citizenship.getGender());
                response.setDateOfBirth(citizenship.getDateOfBirth());
                response.setPlaceOfBirth(citizenship.getPlaceOfBirth());
                response.setCountryOfBirth(citizenship.getCountryOfBirth());
                response.setFamilyCardDocument(citizenship.getFamilyCardNo());
            });
            
            // Emergency
            emergencyRepository.findByEmployeeId(employee.getId()).ifPresent(emergency -> {
                response.setEmergencyContactName(emergency.getContactName());
                response.setEmergencyContactPhone(emergency.getContactPhone());
            });
            
            // Education
            educationRepository.findByEmployeeId(employee.getId()).ifPresent(education -> {
                response.setCertificateLevel(education.getCertificateLevel());
                response.setFieldOfStudy(education.getFieldOfStudy());
                response.setSchool(education.getSchool());
            });
            
            // Family Status
            familyStatusRepository.findByEmployeeId(employee.getId()).ifPresent(familyStatus -> {
                response.setMaritalStatus(familyStatus.getMaritalStatus());
                response.setNumberOfDependentChildren(familyStatus.getNumberOfDependentChildren());
            });
            
            // Documents
            documentRepository.findByEmployeeId(employee.getId()).ifPresent(document -> {
                response.setIdCardCopy(document.getIdCardCopy());
                response.setFamilyCardCopy(document.getFamilyCardCopy());
                response.setDrivingLicenseCopy(document.getDrivingLicenseCopy());
                response.setAssuranceCardCopy(document.getAssuranceCardCopy());
                response.setNpwpCardCopy(document.getNpwpCardCopy());
            });
            
            // Settings
            settingsRepository.findByEmployeeId(employee.getId()).ifPresent(settings -> {
                response.setStatus(settings.getStatus());
                response.setEmployeeType(settings.getEmployeeType());
                response.setRelatedUser(settings.getRelatedUser());
                response.setMonthlyCost(settings.getMonthlyCost());
                response.setAttendanceBadgeId(settings.getAttendanceBadgeId());
            });
            
            return response;
        }
        
    private void updatePrivateInfo(Employee employee, EmployeeCompleteRequest request) {
        EmployeePrivateInfo info = privateInfoRepository.findByEmployeeId(employee.getId())
                .orElse(new EmployeePrivateInfo());

        info.setEmployee(employee);
        info.setPrivateAddress(request.getPrivateAddress());
        info.setPrivateEmail(request.getPrivateEmail());
        info.setPrivatePhone(request.getPrivatePhone());
        info.setBank(request.getBankName());
        info.setBankAccount(request.getAccountNumber());
        info.setBankId(request.getBankId());
        info.setAssurance(request.getAssurance());
        info.setAssuranceId(request.getAssuranceId());
        info.setNpwpId(request.getNpwpId());
        info.setHomeWorkDistance(request.getHomeToWorkDistance());

        privateInfoRepository.save(info);
    }
        
        private void updateCitizenship(Employee employee, EmployeeCompleteRequest request) {
        EmployeeCitizenship citizenship = citizenshipRepository.findByEmployeeId(employee.getId())
                .orElse(new EmployeeCitizenship());

        citizenship.setEmployee(employee);
        citizenship.setNationality(request.getNationality());
        citizenship.setIdentificationNo(request.getIdentificationNumber());
        citizenship.setPassportNo(request.getPassportNumber());
        citizenship.setGender(request.getGender());
        citizenship.setDateOfBirth(request.getDateOfBirth());
        citizenship.setPlaceOfBirth(request.getPlaceOfBirth());
        citizenship.setCountryOfBirth(request.getCountryOfBirth());
        citizenship.setFamilyCardNo(request.getFamilyCardDocument());

        citizenshipRepository.save(citizenship);
    }
        
        private void updateEmergency(Employee employee, EmployeeCompleteRequest request) {
            if (hasEmergency(request)) {
                EmployeeEmergency emergency = emergencyRepository.findByEmployeeId(employee.getId())
                        .orElse(new EmployeeEmergency());
                emergency.setEmployee(employee);
                emergency.setContactName(request.getEmergencyContactName());
                emergency.setContactPhone(request.getEmergencyContactPhone());
                emergencyRepository.save(emergency);
            }
        }
        
        private void updateEducation(Employee employee, EmployeeCompleteRequest request) {
            EmployeeEducation education = educationRepository.findByEmployeeId(employee.getId())
                    .orElse(new EmployeeEducation());

            education.setEmployee(employee);
            education.setCertificateLevel(request.getCertificateLevel());
            education.setFieldOfStudy(request.getFieldOfStudy());
            education.setSchool(request.getSchool());

            educationRepository.save(education);
        }
        
        private void updateFamilyStatus(Employee employee, EmployeeCompleteRequest request) {
            EmployeeFamilyStatus familyStatus = familyStatusRepository.findByEmployeeId(employee.getId())
                    .orElse(new EmployeeFamilyStatus());

            familyStatus.setEmployee(employee);
            familyStatus.setMaritalStatus(request.getMaritalStatus());
            familyStatus.setNumberOfDependentChildren(request.getNumberOfDependentChildren());

            familyStatusRepository.save(familyStatus);
        }
        
        private boolean hasPrivateInfo(EmployeeCompleteRequest request) {
            return request.getPrivateAddress() != null || request.getPrivateEmail() != null ||
                request.getPrivatePhone() != null || request.getBankName() != null;
        }
        
        private boolean hasCitizenship(EmployeeCompleteRequest request) {
            return request.getNationality() != null || request.getGender() != null ||
                request.getDateOfBirth() != null;
        }
        
        private boolean hasEmergency(EmployeeCompleteRequest request) {
            return request.getEmergencyContactName() != null || request.getEmergencyContactPhone() != null;
        }
        
        private boolean hasEducation(EmployeeCompleteRequest request) {
            return request.getCertificateLevel() != null || request.getFieldOfStudy() != null ||
                request.getSchool() != null;
        }
        
        private boolean hasFamilyStatus(EmployeeCompleteRequest request) {
            return request.getMaritalStatus() != null || request.getNumberOfDependentChildren() != null;
        }
        
        private void updateDocuments(Employee employee, EmployeeCompleteRequest request) {
            EmployeeDocument document = documentRepository.findByEmployeeId(employee.getId())
                    .orElse(new EmployeeDocument());
            
            document.setEmployee(employee);
            document.setIdCardCopy(request.getIdCardCopy());
            document.setFamilyCardCopy(request.getFamilyCardCopy());
            document.setDrivingLicenseCopy(request.getDrivingLicenseCopy());
            document.setAssuranceCardCopy(request.getAssuranceCardCopy());
            document.setNpwpCardCopy(request.getNpwpCardCopy());
            
            documentRepository.save(document);
        }
        
        private void updateSettings(Employee employee, EmployeeCompleteRequest request) {
            EmployeeSettings settings = settingsRepository.findByEmployeeId(employee.getId())
                    .orElse(new EmployeeSettings());
            
            settings.setEmployee(employee);
            settings.setStatus(request.getStatus());
            settings.setEmployeeType(request.getEmployeeType());
            settings.setRelatedUser(request.getRelatedUser());
            settings.setMonthlyCost(request.getMonthlyCost());
            settings.setAttendanceBadgeId(request.getAttendanceBadgeId());
            
            settingsRepository.save(settings);
        }
        
        private boolean hasDocuments(EmployeeCompleteRequest request) {
            return request.getIdCardCopy() != null || request.getFamilyCardCopy() != null ||
                request.getDrivingLicenseCopy() != null || request.getAssuranceCardCopy() != null ||
                request.getNpwpCardCopy() != null;
        }
        
        private boolean hasSettings(EmployeeCompleteRequest request) {
            return request.getStatus() != null || request.getEmployeeType() != null ||
                request.getRelatedUser() != null || request.getMonthlyCost() != null ||
                request.getAttendanceBadgeId() != null;
        }
    }
