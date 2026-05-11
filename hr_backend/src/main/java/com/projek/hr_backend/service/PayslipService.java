package com.projek.hr_backend.service;

import com.projek.hr_backend.dto.PayslipResponse;
import com.projek.hr_backend.exception.BadRequestException;
import com.projek.hr_backend.exception.ResourceNotFoundException;
import com.projek.hr_backend.model.Payslip;
import com.projek.hr_backend.model.PayrollPeriod;
import com.projek.hr_backend.model.PayrollPeriodStatus;
import com.projek.hr_backend.model.PayslipComponent;
import com.projek.hr_backend.repository.EmployeeRepository;
import com.projek.hr_backend.repository.PayrollPeriodRepository;
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
    private final PayrollPeriodRepository    payrollPeriodRepository;
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

    /**
     * Approve payslip — mengubah status PayrollPeriod dari DRAFT → FINALIZED.
     * Karena belum ada approve per-payslip, approve satu payslip = approve seluruh periode.
     * Validasi: hanya DRAFT yang boleh di-approve.
     */
    @Transactional
    public PayslipResponse approvePayslip(Long payslipId) {
        Payslip payslip = payslipRepository.findByIdWithDetails(payslipId)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Payslip not found with id: " + payslipId));

        PayrollPeriod period = payslip.getPayrollPeriod();

        if (period.getStatus() != PayrollPeriodStatus.DRAFT) {
            throw new BadRequestException(
                "Cannot approve payslip. Period status is already: " + period.getStatus().name()
                + ". Only DRAFT periods can be approved.");
        }

        period.setStatus(PayrollPeriodStatus.FINALIZED);
        payrollPeriodRepository.save(period);

        List<PayslipComponent> components =
                payslipComponentRepository.findByPayslipId(payslipId);

        return payrollRunService.mapToPayslipResponse(payslip, components);
    }

    /**
     * Delete payslip — hard delete.
     * Validasi: hanya boleh dihapus jika status period masih DRAFT.
     * Komponen payslip ikut terhapus via deleteByPayslipId.
     */
    @Transactional
    public void deletePayslip(Long payslipId) {
        Payslip payslip = payslipRepository.findByIdWithDetails(payslipId)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Payslip not found with id: " + payslipId));

        PayrollPeriod period = payslip.getPayrollPeriod();

        if (period.getStatus() != PayrollPeriodStatus.DRAFT) {
            throw new BadRequestException(
                "Cannot delete payslip. Period status is: " + period.getStatus().name()
                + ". Only payslips in DRAFT period can be deleted.");
        }

        // Hapus komponen dulu, baru payslip
        payslipComponentRepository.deleteByPayslipId(payslipId);
        payslipRepository.deleteById(payslipId);
    }

    /**
     * Mark payslip as paid — mengubah status PayrollPeriod dari FINALIZED → PAID.
     * Validasi: hanya FINALIZED yang boleh di-mark as paid.
     */
    @Transactional
    public PayslipResponse markAsPaid(Long payslipId) {
        Payslip payslip = payslipRepository.findByIdWithDetails(payslipId)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Payslip not found with id: " + payslipId));

        PayrollPeriod period = payslip.getPayrollPeriod();

        if (period.getStatus() != PayrollPeriodStatus.FINALIZED) {
            throw new BadRequestException(
                "Cannot mark as paid. Period status is: " + period.getStatus().name()
                + ". Only FINALIZED periods can be marked as paid.");
        }

        period.setStatus(PayrollPeriodStatus.PAID);
        payrollPeriodRepository.save(period);

        List<PayslipComponent> components =
                payslipComponentRepository.findByPayslipId(payslipId);

        return payrollRunService.mapToPayslipResponse(payslip, components);
    }
}
