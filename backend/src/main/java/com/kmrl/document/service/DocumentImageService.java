package com.kmrl.document.service;

import com.kmrl.document.model.DocumentImage;
import com.kmrl.document.repository.DocumentImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class DocumentImageService {
    
    @Autowired
    private DocumentImageRepository documentImageRepository;
    
    public List<DocumentImage> getImagesByDocumentId(Long documentId) {
        return documentImageRepository.findByDocumentId(documentId);
    }
    
    public Optional<DocumentImage> getImageById(Long imageId) {
        return documentImageRepository.findById(imageId);
    }
    
    public List<DocumentImage> searchImagesByText(Long documentId, String keyword) {
        return documentImageRepository.findByDocumentIdAndTextContentContaining(documentId, keyword);
    }
    
    public List<DocumentImage> searchAllImagesByText(String keyword) {
        return documentImageRepository.findByTextContentContaining(keyword);
    }
    
    public List<DocumentImage> getImagesByLanguage(String language) {
        // Temporarily return empty list until we fix the native query
        return new ArrayList<>();
        // return documentImageRepository.findByLanguagesDetectedContaining(language);
    }
    
    public DocumentImage saveImage(DocumentImage documentImage) {
        return documentImageRepository.save(documentImage);
    }
    
    public void deleteImage(Long imageId) {
        documentImageRepository.deleteById(imageId);
    }
    
    public void deleteImagesByDocumentId(Long documentId) {
        documentImageRepository.deleteByDocumentId(documentId);
    }
    
    public int getImageCountByDocumentId(Long documentId) {
        return documentImageRepository.countByDocumentId(documentId);
    }
}