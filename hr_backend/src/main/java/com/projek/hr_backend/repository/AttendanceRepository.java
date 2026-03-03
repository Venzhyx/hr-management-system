package com.projek.hr_backend.repository;

import com.projek.hr_backend.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    
    List<Attendance> findByEmployeeId(Long employeeId);
    
    Optional<Attendance> findByEmployeeIdAndDate(Long employeeId, LocalDate date);
    
    boolean existsByEmployeeIdAndDate(Long employeeId, LocalDate date);
    
    @Modifying
    @Query("UPDATE Attendance a SET a.employee = null WHERE a.employee.id = :employeeId")
    void setEmployeeIdToNull(Long employeeId);
    
    @Query("SELECT a FROM Attendance a WHERE " +
           "(:dateFrom IS NULL OR a.date >= :dateFrom) AND " +
           "(:dateTo IS NULL OR a.date <= :dateTo) AND " +
           "(:employeeId IS NULL OR a.employee.id = :employeeId) " +
           "ORDER BY a.date DESC, a.checkIn DESC")
    List<Attendance> findByFilters(LocalDate dateFrom, LocalDate dateTo, Long employeeId);
}
