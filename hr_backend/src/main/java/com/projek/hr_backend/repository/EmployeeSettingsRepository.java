package com.projek.hr_backend.repository;

import com.projek.hr_backend.model.EmployeeSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeSettingsRepository extends JpaRepository<EmployeeSettings, Long> {
    Optional<EmployeeSettings> findByEmployeeId(Long employeeId);
    
    @Modifying
    @Query("DELETE FROM EmployeeSettings es WHERE es.employee.id = :employeeId")
    void deleteByEmployeeId(Long employeeId);
}
