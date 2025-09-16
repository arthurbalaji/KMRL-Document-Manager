package com.kmrl.document.service;

import com.kmrl.document.model.*;
import com.kmrl.document.repository.DocumentRepository;
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

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private WebClient.Builder webClientBuilder;

    @Value("${app.upload.directory}")
    private String uploadDirectory;

    @Value("${app.ai-service.url}")
    private String aiServiceUrl;

    public Document uploadDocument(MultipartFile file, User user) throws IOException {
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
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

        // Process with AI service asynchronously
        processDocumentWithAI(document);

        return document;
    }

    private void processDocumentWithAI(Document document) {
        try {
            WebClient webClient = webClientBuilder.build();
            
            Map<String, Object> request = Map.of(
                "file_path", document.getFilePath(),
                "mime_type", document.getMimeType(),
                "document_id", document.getId().toString()
            );

            @SuppressWarnings("unchecked")
            Map<String, Object> response = (Map<String, Object>) webClient.post()
                .uri(aiServiceUrl + "/process-document")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            if (response != null) {
                updateDocumentWithAIResults(document, response);
            }
        } catch (Exception e) {
            System.err.println("Error processing document with AI: " + e.getMessage());
            // Set document to quarantine for manual review
            document.setStatus(DocumentStatus.QUARANTINED);
            documentRepository.save(document);
        }
    }

    @SuppressWarnings("unchecked")
    private void updateDocumentWithAIResults(Document document, Map<String, Object> aiResponse) {
        try {
            // Extract text
            String extractedText = (String) aiResponse.get("extracted_text");
            document.setExtractedText(extractedText);

            // Extract analysis
            Map<String, Object> analysis = (Map<String, Object>) aiResponse.get("analysis");
            if (analysis != null) {
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
                    List<String> roleStrings = (List<String>) roleRec.get("roles");
                    List<Role> roles = roleStrings.stream()
                        .map(Role::valueOf)
                        .toList();
                    document.setAllowedRoles(roles);

                    Double confidence = ((Number) roleRec.get("confidence")).doubleValue();
                    document.setAiConfidence(BigDecimal.valueOf(confidence));

                    // More lenient status assignment - only quarantine very low confidence
                    if (confidence < 0.3) {
                        document.setStatus(DocumentStatus.QUARANTINED);
                    } else {
                        // Most documents should be active for usability
                        document.setStatus(DocumentStatus.ACTIVE);
                    }
                } else {
                    // If no role recommendation, set default roles and active status
                    document.setAllowedRoles(List.of(Role.LEADERSHIP, Role.ENGINEER));
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
        if (user.getRole() == Role.ADMIN) {
            // Admin can see all documents, regardless of status
            if (StringUtils.hasText(search)) {
                // For simplicity, ignore search for now (can be added later)
                return documentRepository.findAllDocuments(pageable);
            } else {
                return documentRepository.findAllDocuments(pageable);
            }
        } else {
            // Regular users see only documents they have access to
            if (StringUtils.hasText(search)) {
                return documentRepository.findByStatusAndAllowedRolesContainingAndSearchTerm(
                    DocumentStatus.ACTIVE.name(), "\"" + user.getRole().name() + "\"", search, pageable);
            } else {
                return documentRepository.findByStatusAndAllowedRolesContaining(
                    DocumentStatus.ACTIVE.name(), "\"" + user.getRole().name() + "\"", pageable);
            }
        }
    }

    public Optional<Document> getDocumentById(Long id, User user) {
        Optional<Document> document = documentRepository.findById(id);
        
        if (document.isPresent()) {
            Document doc = document.get();
            if (doc.hasAccess(user)) {
                return document;
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
}
