package com.kmrl.document.controller;

import com.kmrl.document.model.Document;
import com.kmrl.document.model.DocumentImage;
import com.kmrl.document.model.DocumentStatus;
import com.kmrl.document.model.Role;
import com.kmrl.document.model.User;
import com.kmrl.document.service.DocumentService;
import com.kmrl.document.service.DocumentImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/documents")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @Autowired
    private DocumentImageService documentImageService;
    
    @Autowired
    private WebClient.Builder webClientBuilder;
    
    @Value("${ai.service.url:http://ai-service:5000}")
    private String aiServiceUrl;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Document document = documentService.uploadDocument(file, user);
            
            return ResponseEntity.ok(Map.of(
                "message", "Document uploaded successfully",
                "documentId", document.getId(),
                "filename", document.getOriginalFilename()
            ));
        } catch (IOException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<Page<Document>> getDocuments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        Pageable pageable = PageRequest.of(page, size);
        
        Page<Document> documents = documentService.getDocumentsForUser(user, search, pageable);
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDocument(@PathVariable Long id, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Optional<Document> document = documentService.getDocumentById(id, user);
        
        if (document.isPresent()) {
            return ResponseEntity.ok(document.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long id, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Optional<Document> documentOpt = documentService.getDocumentById(id, user);
            
            if (documentOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Document document = documentOpt.get();
            Resource resource = documentService.getDocumentFile(document);
            
            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(document.getMimeType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                       "attachment; filename=\"" + document.getOriginalFilename() + "\"")
                .body(resource);
                
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/view")
    public ResponseEntity<Resource> viewDocument(@PathVariable Long id, 
                                                @RequestParam(required = false) String token,
                                                Authentication authentication) {
        try {
            User user = null;
            
            // If token is provided as query parameter, validate it
            if (token != null && !token.isEmpty()) {
                // You'll need to inject JwtTokenProvider here to validate token
                // For now, let's use the existing authentication
                user = (User) authentication.getPrincipal();
            } else {
                user = (User) authentication.getPrincipal();
            }
            
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            Optional<Document> documentOpt = documentService.getDocumentById(id, user);
            
            if (documentOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Document document = documentOpt.get();
            Resource resource = documentService.getDocumentFile(document);
            
            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(document.getMimeType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                       "inline; filename=\"" + document.getOriginalFilename() + "\"")
                .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                .header(HttpHeaders.PRAGMA, "no-cache")
                .header(HttpHeaders.EXPIRES, "0")
                .header("X-Frame-Options", "SAMEORIGIN") // Allow iframe from same origin
                .body(resource);
                
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateDocumentStatus(@PathVariable Long id, 
                                                 @RequestBody StatusUpdateRequest request,
                                                 Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            
            // Only admins can update document status
            if (user.getRole() != Role.ADMIN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only administrators can update document status"));
            }
            
            boolean updated = documentService.updateDocumentStatus(id, request.getStatus());
            if (updated) {
                return ResponseEntity.ok(Map.of("message", "Document status updated successfully"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update document status: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long id, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            
            // Only admins can delete documents
            if (user.getRole() != Role.ADMIN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only administrators can delete documents"));
            }
            
            boolean deleted = documentService.deleteDocument(id);
            if (deleted) {
                return ResponseEntity.ok(Map.of("message", "Document deleted successfully"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to delete document: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/reprocess")
    public ResponseEntity<?> reprocessDocument(@PathVariable Long id, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            
            // Only admins can reprocess documents
            if (user.getRole() != Role.ADMIN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only administrators can reprocess documents"));
            }
            
            boolean reprocessed = documentService.reprocessDocument(id);
            if (reprocessed) {
                return ResponseEntity.ok(Map.of("message", "Document reprocessed successfully"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to reprocess document: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/chat")
    public ResponseEntity<?> chatWithDocument(
            @PathVariable Long id,
            @RequestBody ChatRequest request,
            Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Map<String, Object> response = documentService.chatWithDocument(
                id, request.getQuestion(), request.getLanguage(), user);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/search")
    public ResponseEntity<?> globalSearch(
            @RequestBody SearchRequest request,
            Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Map<String, Object> response = documentService.globalSearch(
                request.getQuery(), user, request.getLanguage());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }

    // Inner classes for requests
    public static class ChatRequest {
        private String question;
        private String language = "en";

        public String getQuestion() {
            return question;
        }

        public void setQuestion(String question) {
            this.question = question;
        }

        public String getLanguage() {
            return language;
        }

        public void setLanguage(String language) {
            this.language = language;
        }
    }

    public static class SearchRequest {
        private String query;
        private String language = "en";

        public String getQuery() {
            return query;
        }

        public void setQuery(String query) {
            this.query = query;
        }

        public String getLanguage() {
            return language;
        }

        public void setLanguage(String language) {
            this.language = language;
        }
    }

    public static class StatusUpdateRequest {
        private DocumentStatus status;

        public DocumentStatus getStatus() {
            return status;
        }

        public void setStatus(DocumentStatus status) {
            this.status = status;
        }
    }

    // Image serving endpoints
    @GetMapping("/{documentId}/images")
    public ResponseEntity<List<DocumentImage>> getDocumentImages(@PathVariable Long documentId, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Optional<Document> document = documentService.getDocumentById(documentId, user);
            
            if (document.isEmpty() || !document.get().hasAccess(user)) {
                return ResponseEntity.notFound().build();
            }
            
            List<DocumentImage> images = documentImageService.getImagesByDocumentId(documentId);
            return ResponseEntity.ok(images);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{documentId}/images/{imageId}")
    public ResponseEntity<byte[]> getDocumentImage(@PathVariable Long documentId, @PathVariable Long imageId, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Optional<Document> document = documentService.getDocumentById(documentId, user);
            
            if (document.isEmpty() || !document.get().hasAccess(user)) {
                return ResponseEntity.notFound().build();
            }
            
            Optional<DocumentImage> image = documentImageService.getImageById(imageId);
            if (image.isEmpty() || !image.get().getDocument().getId().equals(documentId)) {
                return ResponseEntity.notFound().build();
            }
            
            // Decode base64 image data
            byte[] imageBytes = Base64.getDecoder().decode(image.get().getImageData());
            
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_PNG) // Default to PNG, could be made dynamic
                    .body(imageBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{documentId}/images/search")
    public ResponseEntity<List<DocumentImage>> searchDocumentImages(@PathVariable Long documentId, @RequestParam String query, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Optional<Document> document = documentService.getDocumentById(documentId, user);
            
            if (document.isEmpty() || !document.get().hasAccess(user)) {
                return ResponseEntity.notFound().build();
            }
            
            List<DocumentImage> images = documentImageService.searchImagesByText(documentId, query);
            return ResponseEntity.ok(images);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/ai-service/images/{documentId}/{imageId}")
    public ResponseEntity<?> getDocumentImage(
            @PathVariable String documentId,
            @PathVariable String imageId,
            Authentication authentication) {
        try {
            WebClient webClient = webClientBuilder.build();
            
            // Forward request to AI service with better error handling
            byte[] imageData = webClient.get()
                .uri(aiServiceUrl + "/images/" + documentId + "/" + imageId)
                .retrieve()
                .onStatus(status -> status.is4xxClientError(), clientResponse -> {
                    System.out.println("Client error from AI service: " + clientResponse.statusCode());
                    return clientResponse.createException();
                })
                .onStatus(status -> status.is5xxServerError(), clientResponse -> {
                    System.out.println("Server error from AI service: " + clientResponse.statusCode());
                    return clientResponse.createException();
                })
                .bodyToMono(byte[].class)
                .doOnError(error -> System.out.println("WebClient error: " + error.getMessage()))
                .block();
            
            if (imageData != null && imageData.length > 0) {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.IMAGE_PNG);
                headers.setContentLength(imageData.length);
                headers.setCacheControl("max-age=3600");
                
                return new ResponseEntity<>(imageData, headers, HttpStatus.OK);
            } else {
                System.out.println("No image data received for: " + documentId + "/" + imageId);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.out.println("Error proxying image request: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to retrieve image: " + e.getMessage()));
        }
    }

    @PostMapping("/ai-service/translate")
    public ResponseEntity<?> translateText(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            WebClient webClient = webClientBuilder.build();
            
            @SuppressWarnings("unchecked")
            Map<String, Object> response = (Map<String, Object>) webClient.post()
                .uri(aiServiceUrl + "/translate")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }
}
