package com.projek.hr_backend.repository;

import com.projek.hr_backend.model.ApprovalSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApprovalSettingRepository extends JpaRepository<ApprovalSetting, Long> {
    Optional<ApprovalSetting> findByModule(String module);
}
