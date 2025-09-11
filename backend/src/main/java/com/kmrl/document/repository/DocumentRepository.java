package com.kmrl.document.repository;

import com.kmrl.document.model.Document;
import com.kmrl.document.model.DocumentStatus;
import com.kmrl.document.model.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    
    Page<Document> findByStatusOrderByUploadDateDesc(DocumentStatus status, Pageable pageable);
    
    @Query(value = "SELECT * FROM documents d WHERE d.status = CAST(:status AS text) AND d.allowed_roles @> CAST(:role AS jsonb) ORDER BY d.upload_date DESC", 
           countQuery = "SELECT count(*) FROM documents d WHERE d.status = CAST(:status AS text) AND d.allowed_roles @> CAST(:role AS jsonb)",
           nativeQuery = true)
    Page<Document> findByStatusAndAllowedRolesContaining(@Param("status") String status, 
                                                        @Param("role") String role, 
                                                        Pageable pageable);
    
    @Query("SELECT d FROM Document d WHERE d.status = :status AND " +
           "(d.originalFilename ILIKE %:search% OR d.summaryEn ILIKE %:search% OR " +
           "CAST(d.tags AS string) ILIKE %:search%) ORDER BY d.uploadDate DESC")
    Page<Document> findByStatusAndSearchTerm(@Param("status") DocumentStatus status,
                                           @Param("search") String search,
                                           Pageable pageable);
    
    @Query(value = "SELECT * FROM documents d WHERE d.status = CAST(:status AS text) AND d.allowed_roles @> CAST(:role AS jsonb) AND " +
           "(d.original_filename ILIKE CONCAT('%', :search, '%') OR d.summary_en ILIKE CONCAT('%', :search, '%') OR " +
           "CAST(d.tags AS text) ILIKE CONCAT('%', :search, '%')) ORDER BY d.upload_date DESC",
           countQuery = "SELECT count(*) FROM documents d WHERE d.status = CAST(:status AS text) AND d.allowed_roles @> CAST(:role AS jsonb) AND " +
           "(d.original_filename ILIKE CONCAT('%', :search, '%') OR d.summary_en ILIKE CONCAT('%', :search, '%') OR " +
           "CAST(d.tags AS text) ILIKE CONCAT('%', :search, '%'))",
           nativeQuery = true)
    Page<Document> findByStatusAndAllowedRolesContainingAndSearchTerm(@Param("status") String status,
                                                                     @Param("role") String role,
                                                                     @Param("search") String search,
                                                                     Pageable pageable);
    
    List<Document> findByUploadedById(Long userId);

    @Query("SELECT d FROM Document d ORDER BY d.uploadDate DESC")
    Page<Document> findAllDocuments(Pageable pageable);
}
