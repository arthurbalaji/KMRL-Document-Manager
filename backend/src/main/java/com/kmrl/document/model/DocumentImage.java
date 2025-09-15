package com.kmrl.document.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "document_images")
public class DocumentImage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    @JsonIgnore
    private Document document;
    
    @Column(name = "image_id")
    private String imageId;
    
    @Column(name = "page_number")
    private Integer pageNumber;
    
    @Column(name = "image_data", columnDefinition = "TEXT")
    private String imageData;
    
    @Column(name = "image_format")
    private String imageFormat;
    
    @Column(name = "text_content", columnDefinition = "TEXT")
    private String textContent;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "languages_detected", columnDefinition = "JSONB")
    private List<String> languagesDetected;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "bbox", columnDefinition = "JSONB")
    private Map<String, Double> bbox;
    
    @Column(name = "extraction_confidence")
    private Double extractionConfidence;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // Constructors
    public DocumentImage() {
        this.createdAt = LocalDateTime.now();
    }
    
    public DocumentImage(Document document, String imageId, String imageData, String textContent, 
                        Integer pageNumber, List<String> languagesDetected) {
        this.document = document;
        this.imageId = imageId;
        this.imageData = imageData;
        this.textContent = textContent;
        this.pageNumber = pageNumber;
        this.languagesDetected = languagesDetected;
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Document getDocument() {
        return document;
    }
    
    public void setDocument(Document document) {
        this.document = document;
    }
    
    public String getImageId() {
        return imageId;
    }
    
    public void setImageId(String imageId) {
        this.imageId = imageId;
    }
    
    public Integer getPageNumber() {
        return pageNumber;
    }
    
    public void setPageNumber(Integer pageNumber) {
        this.pageNumber = pageNumber;
    }
    
    public String getImageData() {
        return imageData;
    }
    
    public void setImageData(String imageData) {
        this.imageData = imageData;
    }
    
    public String getImageFormat() {
        return imageFormat;
    }
    
    public void setImageFormat(String imageFormat) {
        this.imageFormat = imageFormat;
    }
    
    public String getTextContent() {
        return textContent;
    }
    
    public void setTextContent(String textContent) {
        this.textContent = textContent;
    }
    
    public List<String> getLanguagesDetected() {
        return languagesDetected;
    }
    
    public void setLanguagesDetected(List<String> languagesDetected) {
        this.languagesDetected = languagesDetected;
    }
    
    public Map<String, Double> getBbox() {
        return bbox;
    }
    
    public void setBbox(Map<String, Double> bbox) {
        this.bbox = bbox;
    }
    
    public Double getExtractionConfidence() {
        return extractionConfidence;
    }
    
    public void setExtractionConfidence(Double extractionConfidence) {
        this.extractionConfidence = extractionConfidence;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}