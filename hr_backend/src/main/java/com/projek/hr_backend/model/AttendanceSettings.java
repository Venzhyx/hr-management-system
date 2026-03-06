package com.projek.hr_backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceSettings {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "tolerance_time_in_favor_of_employee", nullable = false)
    private Integer toleranceTimeInFavorOfEmployee = 0;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "extra_hours_validation", nullable = false)
    private ExtraHoursValidation extraHoursValidation = ExtraHoursValidation.APPROVED_BY_MANAGER;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
