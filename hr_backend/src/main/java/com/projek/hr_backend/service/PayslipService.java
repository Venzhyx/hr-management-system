package com.projek.hr_backend.service;

import com.projek.hr_backend.dto.PayslipResponse;
import com.projek.hr_backend.exception.ResourceNotFoundException;
import com.projek.hr_backend.model.Payslip;
import com.projek.hr_backend.model.PayslipComponent;
import com.projek.hr_backend.repository.EmployeeRepository;
import com.projek.hr_backend.repository.PayslipComponentRepository;
import com.projek.hr_backend.repository.PayslipRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PayslipService {

    private final PayslipRepository          payslipRepository;
    private final PayslipComponentRepository payslipComponentRepository;
    private final EmployeeRepository         employeeRepository;
    private final PayrollRunService          payrollRunService;

    /**
     * Get semua payslip milik satu employee, diurutkan terbaru dulu.
     */
    @Transactional(readOnly = true)
    public List<PayslipResponse> getPayslipsByEmployee(Long employeeId) {
        employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Employee not found with id: " + employeeId));

        return payslipRepository.findByEmployeeIdWithPeriod(employeeId).stream()
                .map(p -> {
                    List<PayslipComponent> components =
                            payslipComponentRepository.findByPayslipId(p.getId());
                    return payrollRunService.mapToPayslipResponse(p, components);
                })
                .collect(Collectors.toList());
    }

    /**
     * Get detail satu payslip lengkap dengan semua komponen.
     */
    @Transactional(readOnly = true)
    public PayslipResponse getPayslipDetail(Long payslipId) {
        Payslip payslip = payslipRepository.findByIdWithDetails(payslipId)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Payslip not found with id: " + payslipId));

        List<PayslipComponent> components =
                payslipComponentRepository.findByPayslipId(payslipId);

        return payrollRunService.mapToPayslipResponse(payslip, components);
    }
}
