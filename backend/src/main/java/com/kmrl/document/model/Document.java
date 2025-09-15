package com.kmrl.document.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "documents")
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 255)
    private String filename;

    @NotBlank
    @Size(max = 255)
    private String originalFilename;

    @NotBlank
    @Size(max = 500)
    private String filePath;

    @NotNull
    private Long fileSize;

    @NotBlank
    @Size(max = 100)
    private String mimeType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    @JsonIgnore
    private User uploadedBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime uploadDate;

    @Column(columnDefinition = "TEXT")
    private String summaryEn;

    @Column(columnDefinition = "TEXT")
    private String summaryMl;

    @Column(columnDefinition = "TEXT")
    private String extractedText;

    @JdbcTypeCode(SqlTypes.JSON)
    private List<String> tags;

    @JdbcTypeCode(SqlTypes.JSON)
    private List<Role> allowedRoles;

    @Column(precision = 3, scale = 2)
    private BigDecimal aiConfidence;

    @Enumerated(EnumType.STRING)
    private SensitivityLevel sensitivityLevel = SensitivityLevel.MEDIUM;

    private Integer retentionDays = 2555;

    private LocalDate expiryDate;

    @Enumerated(EnumType.STRING)
    private DocumentStatus status = DocumentStatus.ACTIVE;

    @JdbcTypeCode(SqlTypes.JSON)
    private List<Double> embeddings;

    // Multilingual and image support fields
    @JdbcTypeCode(SqlTypes.JSON)
    private List<String> languagesDetected;

    private Integer imagesCount = 0;

    private Boolean hasMultilingualContent = false;

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<DocumentImage> images;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Constructors
    public Document() {}

    public Document(String filename, String originalFilename, String filePath, Long fileSize, String mimeType, User uploadedBy) {
        this.filename = filename;
        this.originalFilename = originalFilename;
        this.filePath = filePath;
        this.fileSize = fileSize;
        this.mimeType = mimeType;
        this.uploadedBy = uploadedBy;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public String getOriginalFilename() {
        return originalFilename;
    }

    public void setOriginalFilename(String originalFilename) {
        this.originalFilename = originalFilename;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public User getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(User uploadedBy) {
        this.uploadedBy = uploadedBy;
    }

    public LocalDateTime getUploadDate() {
        return uploadDate;
    }

    public void setUploadDate(LocalDateTime uploadDate) {
        this.uploadDate = uploadDate;
    }

    public String getSummaryEn() {
        return summaryEn;
    }

    public void setSummaryEn(String summaryEn) {
        this.summaryEn = summaryEn;
    }

    public String getSummaryMl() {
        return summaryMl;
    }

    public void setSummaryMl(String summaryMl) {
        this.summaryMl = summaryMl;
    }

    public String getExtractedText() {
        return extractedText;
    }

    public void setExtractedText(String extractedText) {
        this.extractedText = extractedText;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public List<Role> getAllowedRoles() {
        return allowedRoles;
    }

    public void setAllowedRoles(List<Role> allowedRoles) {
        this.allowedRoles = allowedRoles;
    }

    public BigDecimal getAiConfidence() {
        return aiConfidence;
    }

    public void setAiConfidence(BigDecimal aiConfidence) {
        this.aiConfidence = aiConfidence;
    }

    public SensitivityLevel getSensitivityLevel() {
        return sensitivityLevel;
    }

    public void setSensitivityLevel(SensitivityLevel sensitivityLevel) {
        this.sensitivityLevel = sensitivityLevel;
    }

    public Integer getRetentionDays() {
        return retentionDays;
    }

    public void setRetentionDays(Integer retentionDays) {
        this.retentionDays = retentionDays;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public DocumentStatus getStatus() {
        return status;
    }

    public void setStatus(DocumentStatus status) {
        this.status = status;
    }

    public List<Double> getEmbeddings() {
        return embeddings;
    }

    public void setEmbeddings(List<Double> embeddings) {
        this.embeddings = embeddings;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<String> getLanguagesDetected() {
        return languagesDetected;
    }

    public void setLanguagesDetected(List<String> languagesDetected) {
        this.languagesDetected = languagesDetected;
    }

    public Integer getImagesCount() {
        return imagesCount;
    }

    public void setImagesCount(Integer imagesCount) {
        this.imagesCount = imagesCount;
    }

    public Boolean getHasMultilingualContent() {
        return hasMultilingualContent;
    }

    public void setHasMultilingualContent(Boolean hasMultilingualContent) {
        this.hasMultilingualContent = hasMultilingualContent;
    }

    public List<DocumentImage> getImages() {
        return images;
    }

    public void setImages(List<DocumentImage> images) {
        this.images = images;
    }

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);
        this.uploadDate = now;
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now(ZoneOffset.UTC);
    }

    // Helper method to check if user has access
    public boolean hasAccess(User user) {
        if (user.getRole() == Role.ADMIN) {
            return true;
        }
        return allowedRoles != null && allowedRoles.contains(user.getRole());
    }
}
