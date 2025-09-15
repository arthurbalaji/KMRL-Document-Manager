package com.kmrl.document.repository;

import com.kmrl.document.model.DocumentImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentImageRepository extends JpaRepository<DocumentImage, Long> {
    // Find images by language using method query (JPA will auto-generate this)
    List<DocumentImage> findByDocumentId(Long documentId);

    @Query("SELECT di FROM DocumentImage di WHERE di.document.id = :documentId AND di.textContent LIKE CONCAT('%', :keyword, '%')")
    List<DocumentImage> findByDocumentIdAndTextContentContaining(@Param("documentId") Long documentId, @Param("keyword") String keyword);
    
    @Query("SELECT di FROM DocumentImage di WHERE di.textContent LIKE CONCAT('%', :keyword, '%')")
    List<DocumentImage> findByTextContentContaining(@Param("keyword") String keyword);
    
    // Remove the problematic native query for now - we'll implement this differently
    // @Query(value = "SELECT * FROM document_images WHERE languages_detected::jsonb ? :language", nativeQuery = true)
    // List<DocumentImage> findByLanguagesDetectedContaining(@Param("language") String language);
    
    @Query("SELECT COUNT(di) FROM DocumentImage di WHERE di.document.id = :documentId")
    int countByDocumentId(@Param("documentId") Long documentId);
    
    void deleteByDocumentId(Long documentId);
}