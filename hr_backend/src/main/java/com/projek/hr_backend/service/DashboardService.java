package com.projek.hr_backend.service;

import com.projek.hr_backend.dto.DashboardSummaryResponse;
import com.projek.hr_backend.model.EmployeeType;
import com.projek.hr_backend.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {
    
    private final EmployeeRepository employeeRepository;
    
    public DashboardSummaryResponse getDashboardSummary() {
        long totalEmployee = employeeRepository.count();
        long totalFullTime = employeeRepository.countBySettingsEmployeeType(EmployeeType.FULL_TIME);
        long totalPartTime = employeeRepository.countBySettingsEmployeeType(EmployeeType.PART_TIME);
        long totalContract = employeeRepository.countBySettingsEmployeeType(EmployeeType.CONTRACT);
        
        Map<String, Long> monthlyJoinStatistic = new LinkedHashMap<>();
        List<Object[]> statistics = employeeRepository.getMonthlyJoinStatistics();
        
        for (Object[] stat : statistics) {
            String month = (String) stat[0];
            Long count = ((Number) stat[1]).longValue();
            monthlyJoinStatistic.put(month, count);
        }
        
        return new DashboardSummaryResponse(
                totalEmployee,
                totalFullTime,
                totalPartTime,
                totalContract,
                monthlyJoinStatistic
        );
    }
}
