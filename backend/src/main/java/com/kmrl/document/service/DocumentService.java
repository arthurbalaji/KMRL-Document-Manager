package com.kmrl.document.service;

import com.kmrl.document.model.*;
import com.kmrl.document.repository.DocumentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.*;

import jakarta.annotation.PostConstruct;

@Service
public class DocumentService {

    private static final Logger logger = LoggerFactory.getLogger(DocumentService.class);

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private WebClient.Builder webClientBuilder;

    @Value("${app.upload.directory}")
    private String uploadDirectory;

    @Value("${app.ai-service.url}")
    private String aiServiceUrl;

    // One-time backfill on startup to fix legacy rows with null aiConfidence
    @PostConstruct
    public void backfillMissingConfidence() {
        try {
            List<Document> all = documentRepository.findAll();
            int updated = 0;
            for (Document d : all) {
                boolean hasAnalysis =
                    (d.getSummaryEn() != null && !d.getSummaryEn().isBlank()) ||
                    (d.getSummaryMl() != null && !d.getSummaryMl().isBlank()) ||
                    (d.getExtractedText() != null && !d.getExtractedText().isBlank());
                if (d.getAiConfidence() == null && hasAnalysis) {
                    d.setAiConfidence(BigDecimal.valueOf(0.75));
                    updated++;
                }
            }
            if (updated > 0) {
                documentRepository.saveAll(all);
                System.out.println("Backfill: set default aiConfidence for " + updated + " documents");
            }
        } catch (Exception e) {
            System.err.println("Backfill error: " + e.getMessage());
        }
    }

    public Document uploadDocument(MultipartFile file, User user) throws IOException {
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (!isValidFileType(contentType)) {
            throw new IllegalArgumentException("Unsupported file type: " + contentType);
        }

        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDirectory);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf('.'));
        String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
        
        // Save file
        Path targetLocation = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        // Create document entity
        Document document = new Document(
            uniqueFilename,
            originalFilename,
            targetLocation.toString(),
            file.getSize(),
            file.getContentType(),
            user
        );

        // Save to database
        document = documentRepository.save(document);
        logger.info("Document saved with ID: {}", document.getId());

        // Process with AI service asynchronously
        logger.info("About to call processDocumentWithAI for document: {}", document.getId());
        try {
            processDocumentWithAI(document);
            logger.info("processDocumentWithAI call completed for document: {}", document.getId());
        } catch (Exception e) {
            logger.error("Exception calling processDocumentWithAI: {}", e.getMessage(), e);
        }

        return document;
    }

    private void processDocumentWithAI(Document document) {
        logger.info("=== Starting AI processing for document: {} ===", document.getId());
        logger.info("Document path: {}", document.getFilePath());
        logger.info("MIME type: {}", document.getMimeType());
        logger.info("AI Service URL: {}", aiServiceUrl);
        
        try {
            WebClient webClient = webClientBuilder.build();
            
            Map<String, Object> request = Map.of(
                "file_path", document.getFilePath(),
                "mime_type", document.getMimeType(),
                "document_id", document.getId().toString()
            );

            logger.info("Sending request to AI service: {}", request);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = (Map<String, Object>) webClient.post()
                .uri(aiServiceUrl + "/process-document")
                .bodyValue(request)
                .retrieve()
                .onStatus(
                    status -> !status.is2xxSuccessful(),
                    clientResponse -> {
                        System.err.println("AI service returned error status: " + clientResponse.statusCode());
                        return clientResponse.bodyToMono(String.class)
                            .map(body -> new RuntimeException("AI service error: " + body));
                    }
                )
                .bodyToMono(Map.class)
                .timeout(java.time.Duration.ofSeconds(60))
                .block();

            logger.info("Received AI response: {}", (response != null ? "Success" : "Null"));
            if (response != null) {
                logger.info("Response keys: {}", response.keySet());
                updateDocumentWithAIResults(document, response);
            } else {
                logger.error("AI service returned null response");
            }
        } catch (Exception e) {
            logger.error("Error processing document with AI: {}", e.getMessage(), e);
            // Set document to quarantine for manual review
            document.setStatus(DocumentStatus.QUARANTINED);
            documentRepository.save(document);
        }
        
        logger.info("=== Finished AI processing for document: {} ===", document.getId());
    }

    @SuppressWarnings("unchecked")
    private void updateDocumentWithAIResults(Document document, Map<String, Object> aiResponse) {
        logger.info("=== Updating document with AI results ===");
        logger.info("AI Response structure: {}", aiResponse.keySet());
        
        try {
            // Extract text
            String extractedText = (String) aiResponse.get("extracted_text");
            System.out.println("Extracted text length: " + (extractedText != null ? extractedText.length() : "null"));
            document.setExtractedText(extractedText);

            // Extract analysis
            Map<String, Object> analysis = (Map<String, Object>) aiResponse.get("analysis");
            System.out.println("Analysis object: " + (analysis != null ? "Found" : "Null"));
            if (analysis != null) {
                System.out.println("Analysis keys: " + analysis.keySet());
                
                document.setSummaryEn((String) analysis.get("summary_en"));
                document.setSummaryMl((String) analysis.get("summary_ml"));
                
                List<String> tags = (List<String>) analysis.get("tags");
                document.setTags(tags);

                String sensitivityLevel = (String) analysis.get("sensitivity_level");
                if (sensitivityLevel != null) {
                    document.setSensitivityLevel(SensitivityLevel.valueOf(sensitivityLevel));
                }

                // Handle role recommendations
                Map<String, Object> roleRec = (Map<String, Object>) analysis.get("recommended_roles");
                if (roleRec != null) {
                    logger.info("Role recommendation data: {}", roleRec);
                    logger.info("Role recommendation keys: {}", roleRec.keySet());
                    
                    List<String> roleStrings = (List<String>) roleRec.get("roles");
                    if (roleStrings != null) {
                        List<Role> roles = roleStrings.stream()
                            .map(roleStr -> {
                                try {
                                    return Role.valueOf(roleStr);
                                } catch (IllegalArgumentException e) {
                                    logger.warn("Unknown role '{}' from AI service, skipping", roleStr);
                                    return null;
                                }
                            })
                            .filter(Objects::nonNull)
                            .toList();
                        document.setAllowedRoles(roles.isEmpty() ? List.of(Role.LEADERSHIP) : roles);
                    }

                    // Enhanced confidence extraction with better error handling
                    Object confidenceObj = roleRec.get("confidence");
                    logger.info("Looking for confidence in roleRec...");
                    logger.info("Confidence object: {} (type: {})", confidenceObj, 
                        (confidenceObj != null ? confidenceObj.getClass().getSimpleName() : "null"));
                    logger.info("All keys in roleRec: {}", roleRec.keySet());
                    logger.info("Full roleRec content: {}", roleRec);
                    
                    if (confidenceObj != null) {
                        try {
                            Double confidence = null;
                            if (confidenceObj instanceof Number) {
                                confidence = ((Number) confidenceObj).doubleValue();
                            } else if (confidenceObj instanceof String) {
                                confidence = Double.parseDouble((String) confidenceObj);
                            }
                            
                            if (confidence != null) {
                                document.setAiConfidence(BigDecimal.valueOf(confidence));
                                logger.info("Set AI confidence to: {}", confidence);
                                
                                // More lenient status assignment - only quarantine very low confidence
                                if (confidence < 0.3) {
                                    document.setStatus(DocumentStatus.QUARANTINED);
                                } else {
                                    document.setStatus(DocumentStatus.ACTIVE);
                                }
                            } else {
                                System.out.println("Could not parse confidence value: " + confidenceObj);
                                // Set default confidence when parsing fails
                                document.setAiConfidence(BigDecimal.valueOf(0.75));
                                System.out.println("Set default AI confidence to: 0.75");
                                document.setStatus(DocumentStatus.ACTIVE);
                            }
                        } catch (Exception e) {
                            System.err.println("Error parsing confidence: " + e.getMessage());
                            // Set default confidence when exception occurs
                            document.setAiConfidence(BigDecimal.valueOf(0.75));
                            System.out.println("Set default AI confidence to: 0.75 (after exception)");
                            document.setStatus(DocumentStatus.ACTIVE);
                        }
                    } else {
                        System.out.println("No confidence value found in role recommendation");
                        // Set default confidence when no confidence found
                        document.setAiConfidence(BigDecimal.valueOf(0.75));
                        System.out.println("Set default AI confidence to: 0.75 (no confidence in response)");
                        document.setStatus(DocumentStatus.ACTIVE);
                    }
                } else {
                    System.out.println("No role recommendation found in analysis");
                    // If no role recommendation, set default roles, confidence, and active status
                    document.setAllowedRoles(List.of(Role.LEADERSHIP, Role.ENGINEER));
                    document.setAiConfidence(BigDecimal.valueOf(0.75));
                    System.out.println("Set default AI confidence to: 0.75 (no role recommendation)");
                    document.setStatus(DocumentStatus.ACTIVE);
                }

                // Handle retention
                Map<String, Object> retention = (Map<String, Object>) analysis.get("retention_recommendation");
                if (retention != null) {
                    Integer days = (Integer) retention.get("days");
                    if (days != null) {
                        document.setRetentionDays(days);
                        document.setExpiryDate(LocalDate.now().plusDays(days));
                    }
                }
            }

            // Extract embeddings
            List<Double> embeddings = (List<Double>) aiResponse.get("embeddings");
            document.setEmbeddings(embeddings);

            documentRepository.save(document);

        } catch (Exception e) {
            System.err.println("Error updating document with AI results: " + e.getMessage());
            document.setStatus(DocumentStatus.QUARANTINED);
            documentRepository.save(document);
        }
    }

    public Page<Document> getDocumentsForUser(User user, String search, Pageable pageable) {
        Page<Document> page;

        if (user.getRole() == Role.ADMIN) {
            // Admin can see all documents, regardless of status
            if (StringUtils.hasText(search)) {
                // For simplicity, ignore search for now (can be added later)
                page = documentRepository.findAllDocuments(pageable);
            } else {
                page = documentRepository.findAllDocuments(pageable);
            }
        } else {
            // Regular users see only documents they have access to
            if (StringUtils.hasText(search)) {
                page = documentRepository.findByStatusAndAllowedRolesContainingAndSearchTerm(
                    DocumentStatus.ACTIVE.name(), "\"" + user.getRole().name() + "\"", search, pageable);
            } else {
                page = documentRepository.findByStatusAndAllowedRolesContaining(
                    DocumentStatus.ACTIVE.name(), "\"" + user.getRole().name() + "\"", pageable);
            }
        }

        // Backfill: ensure aiConfidence is set if analysis exists but confidence is null
        page.getContent().forEach(doc -> {
            try {
                boolean hasAnalysis =
                    (doc.getSummaryEn() != null && !doc.getSummaryEn().isBlank()) ||
                    (doc.getSummaryMl() != null && !doc.getSummaryMl().isBlank()) ||
                    (doc.getExtractedText() != null && !doc.getExtractedText().isBlank());

                if (doc.getAiConfidence() == null && hasAnalysis) {
                    doc.setAiConfidence(BigDecimal.valueOf(0.75));
                    // Don't change status here; this is a backfill for display consistency
                    documentRepository.save(doc);
                }
            } catch (Exception ignored) {
                // Non-fatal; continue
            }
        });

        return page;
    }

    public Optional<Document> getDocumentById(Long id, User user) {
        Optional<Document> document = documentRepository.findById(id);
        
        if (document.isPresent()) {
            Document doc = document.get();
            if (doc.hasAccess(user)) {
                // Backfill single-document fetch as well
                try {
                    boolean hasAnalysis =
                        (doc.getSummaryEn() != null && !doc.getSummaryEn().isBlank()) ||
                        (doc.getSummaryMl() != null && !doc.getSummaryMl().isBlank()) ||
                        (doc.getExtractedText() != null && !doc.getExtractedText().isBlank());

                    if (doc.getAiConfidence() == null && hasAnalysis) {
                        doc.setAiConfidence(BigDecimal.valueOf(0.75));
                        documentRepository.save(doc);
                    }
                } catch (Exception ignored) {}

                return Optional.of(doc);
            }
        }
        
        return Optional.empty();
    }

    public Resource getDocumentFile(Document document) throws IOException {
        Path filePath = Paths.get(document.getFilePath());
        Resource resource = new UrlResource(filePath.toUri());
        
        if (resource.exists() && resource.isReadable()) {
            return resource;
        } else {
            throw new IOException("File not found or not readable: " + document.getFilePath());
        }
    }

    public Map<String, Object> chatWithDocument(Long documentId, String question, String language, User user) {
        Optional<Document> docOpt = getDocumentById(documentId, user);
        if (docOpt.isEmpty()) {
            throw new IllegalArgumentException("Document not found or access denied");
        }

        Document document = docOpt.get();
        
        try {
            WebClient webClient = webClientBuilder.build();
            
            Map<String, Object> request = Map.of(
                "document_text", document.getExtractedText() != null ? document.getExtractedText() : "",
                "question", question,
                "language", language,
                "document_id", documentId.toString()
            );

            @SuppressWarnings("unchecked")
            Map<String, Object> chatResponse = (Map<String, Object>) webClient.post()
                .uri(aiServiceUrl + "/chat/document")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
            
            return chatResponse;

        } catch (Exception e) {
            throw new RuntimeException("Error chatting with document: " + e.getMessage());
        }
    }

    public Map<String, Object> globalSearch(String query, User user, String language) {
        try {
            WebClient webClient = webClientBuilder.build();
            
            List<String> userRoles = user.getRole() == Role.ADMIN ? 
                Arrays.asList("LEADERSHIP", "HR", "FINANCE", "ENGINEER", "ADMIN") :
                List.of(user.getRole().name());
            
            Map<String, Object> request = Map.of(
                "query", query,
                "user_roles", userRoles,
                "language", language
            );

            @SuppressWarnings("unchecked")
            Map<String, Object> searchResponse = (Map<String, Object>) webClient.post()
                .uri(aiServiceUrl + "/chat/global")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
            
            return searchResponse;

        } catch (Exception e) {
            throw new RuntimeException("Error performing global search: " + e.getMessage());
        }
    }

    public boolean updateDocumentStatus(Long documentId, DocumentStatus status) {
        try {
            Optional<Document> documentOpt = documentRepository.findById(documentId);
            if (documentOpt.isPresent()) {
                Document document = documentOpt.get();
                document.setStatus(status);
                documentRepository.save(document);
                return true;
            }
            return false;
        } catch (Exception e) {
            throw new RuntimeException("Error updating document status: " + e.getMessage());
        }
    }

    public boolean deleteDocument(Long documentId) {
        try {
            Optional<Document> documentOpt = documentRepository.findById(documentId);
            if (documentOpt.isPresent()) {
                Document document = documentOpt.get();
                
                // Delete the physical file
                try {
                    Path filePath = Paths.get(document.getFilePath());
                    if (Files.exists(filePath)) {
                        Files.delete(filePath);
                    }
                } catch (IOException e) {
                    System.err.println("Warning: Could not delete physical file: " + e.getMessage());
                }
                
                // Delete from database
                documentRepository.delete(document);
                return true;
            }
            return false;
        } catch (Exception e) {
            throw new RuntimeException("Error deleting document: " + e.getMessage());
        }
    }

    public boolean reprocessDocument(Long documentId) {
        try {
            Optional<Document> documentOpt = documentRepository.findById(documentId);
            if (documentOpt.isPresent()) {
                Document document = documentOpt.get();
                
                // Reset document status and reprocess with AI
                document.setStatus(DocumentStatus.ACTIVE);
                document.setSummaryEn(null);
                document.setTags(null);
                document.setAllowedRoles(null);
                document.setAiConfidence(null);
                
                documentRepository.save(document);
                
                // Reprocess with AI service
                processDocumentWithAI(document);
                
                return true;
            }
            return false;
        } catch (Exception e) {
            throw new RuntimeException("Error reprocessing document: " + e.getMessage());
        }
    }

    private boolean isValidFileType(String contentType) {
        if (contentType == null) {
            return false;
        }
        
        return contentType.equals("application/pdf") ||
               contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document") ||
               contentType.equals("application/vnd.openxmlformats-officedocument.presentationml.presentation") ||
               contentType.equals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") ||
               contentType.equals("application/vnd.ms-excel") ||
               contentType.equals("application/vnd.ms-powerpoint") ||
               contentType.equals("application/msword") ||
               contentType.equals("text/plain") ||
               contentType.equals("text/csv") ||
               contentType.equals("application/rtf") ||
               contentType.startsWith("image/");
    }
}
