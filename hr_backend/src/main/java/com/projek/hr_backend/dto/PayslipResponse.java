package com.projek.hr_backend.dto;

import com.projek.hr_backend.model.PayrollPeriodStatus;
import com.projek.hr_backend.model.PayslipComponentType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayslipResponse {

    private Long id;
    private Long employeeId;
    private String employeeName;

    // Info periode
    private Long periodId;
    private String periodLabel;   // contoh: "April 2026"
    private Integer month;
    private Integer year;

    // Status diambil dari PayrollPeriod — semua payslip dalam satu periode punya status sama
    private PayrollPeriodStatus status;

    // Komponen gaji — snapshot immutable
    private BigDecimal basicSalary;
    private BigDecimal overtimePay;
    private BigDecimal totalEarning;
    private BigDecimal totalDeduction;
    private BigDecimal netSalary;

    // Ringkasan overtime & attendance
    private Double  totalOvertimeHours;
    private Integer totalAbsent;
    private Integer totalLate;

    private LocalDateTime generatedAt;

    // Detail komponen baris per baris
    private List<ComponentItem> components;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComponentItem {
        private Long id;
        private String componentName;
        private PayslipComponentType type;
        private BigDecimal amount;
    }
}
