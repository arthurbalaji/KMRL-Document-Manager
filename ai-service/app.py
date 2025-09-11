import os
import logging
import json
import traceback
from datetime import datetime
from typing import Dict, List, Tuple, Optional

import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import pytesseract
from PIL import Image
import PyPDF2
from docx import Document
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from langdetect import detect, DetectorFactory
import re

# Ensure consistent language detection
DetectorFactory.seed = 0

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure DeepSeek V2
deepseek_api_key = os.getenv('DEEPSEEK_API_KEY')
if not deepseek_api_key:
    logger.error("DEEPSEEK_API_KEY not found in environment variables")
    raise ValueError("DEEPSEEK_API_KEY is required")

logger.info(f"Configuring DeepSeek V2 with API key: {deepseek_api_key[:10]}...")

# DeepSeek API configuration
DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1/chat/completions"
DEEPSEEK_HEADERS = {
    "Authorization": f"Bearer {deepseek_api_key}",
    "Content-Type": "application/json"
}

def call_deepseek_api(messages, max_tokens=4000, temperature=0.3):
    """Call DeepSeek API using direct HTTP requests"""
    try:
        payload = {
            "model": "deepseek-chat",
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        
        response = requests.post(
            DEEPSEEK_BASE_URL,
            headers=DEEPSEEK_HEADERS,
            json=payload,
            timeout=60
        )
        
        if response.status_code == 200:
            data = response.json()
            return data["choices"][0]["message"]["content"]
        else:
            logger.error(f"DeepSeek API error: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        logger.error(f"DeepSeek API call failed: {str(e)}")
        return None

# Test DeepSeek connectivity
try:
    test_response = call_deepseek_api([{"role": "user", "content": "Test connection"}], max_tokens=10)
    if test_response:
        logger.info("DeepSeek V2 API connection successful")
    else:
        logger.error("DeepSeek V2 API connection failed")
        logger.warning("AI analysis will fall back to heuristic methods")
except Exception as e:
    logger.error(f"DeepSeek V2 API connection test failed: {str(e)}")
    logger.warning("AI analysis will fall back to heuristic methods")

# Database connection
def get_db_connection():
    return psycopg2.connect(
        os.getenv('DATABASE_URL'),
        cursor_factory=RealDictCursor
    )

class DocumentProcessor:
    def __init__(self):
        self.role_keywords = {
            'LEADERSHIP': [
                'board', 'director', 'executive', 'strategy', 'policy', 'decision',
                'approval', 'management', 'leadership', 'governance', 'vision',
                'mission', 'objectives', 'planning', 'budget approval', 'oversight'
            ],
            'HR': [
                'employee', 'staff', 'recruitment', 'hiring', 'payroll', 'salary',
                'benefits', 'training', 'performance', 'appraisal', 'leave',
                'attendance', 'resignation', 'termination', 'grievance', 'policy'
            ],
            'FINANCE': [
                'budget', 'finance', 'accounting', 'audit', 'expense', 'revenue',
                'cost', 'invoice', 'payment', 'procurement', 'vendor', 'contract',
                'financial', 'expenditure', 'income', 'profit', 'loss', 'balance'
            ],
            'ENGINEER': [
                'technical', 'engineering', 'design', 'specification', 'maintenance',
                'construction', 'project', 'infrastructure', 'system', 'equipment',
                'safety', 'quality', 'testing', 'inspection', 'drawing', 'blueprint'
            ]
        }
    
    def extract_text_from_file(self, file_path: str, mime_type: str) -> str:
        """Extract text from various file formats."""
        try:
            if mime_type == 'application/pdf':
                return self._extract_from_pdf(file_path)
            elif mime_type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                return self._extract_from_docx(file_path)
            elif mime_type.startswith('image/'):
                return self._extract_from_image(file_path)
            else:
                return ""
        except Exception as e:
            logger.error(f"Error extracting text from {file_path}: {str(e)}")
            return ""
    
    def _extract_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF file."""
        text = ""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
        except Exception as e:
            logger.error(f"PDF extraction error: {str(e)}")
        return text.strip()
    
    def _extract_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX file."""
        try:
            doc = Document(file_path)
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            return text.strip()
        except Exception as e:
            logger.error(f"DOCX extraction error: {str(e)}")
            return ""
    
    def _extract_from_image(self, file_path: str) -> str:
        """Extract text from image using OCR."""
        try:
            # Configure Tesseract for English and Malayalam
            custom_config = r'--oem 3 --psm 6 -l eng+mal'
            image = Image.open(file_path)
            text = pytesseract.image_to_string(image, config=custom_config)
            return text.strip()
        except Exception as e:
            logger.error(f"OCR extraction error: {str(e)}")
            return ""
    
    def detect_language(self, text: str) -> str:
        """Detect the primary language of the text."""
        try:
            # Clean text for language detection
            clean_text = re.sub(r'[^\w\s]', ' ', text)
            if len(clean_text.strip()) < 10:
                return 'en'  # Default to English for short texts
            
            detected = detect(clean_text)
            return detected
        except:
            return 'en'  # Default to English if detection fails
    
    def generate_ai_analysis(self, text: str) -> Dict:
        """Generate comprehensive AI analysis of document."""
        try:
            # Detect language
            primary_language = self.detect_language(text)
            logger.info(f"Starting AI analysis for document with {len(text)} characters")
            
            # Create analysis prompt
            prompt = f"""
            Analyze the following document text and provide a comprehensive analysis:

            Document Text:
            {text[:4000]}  # Limit text to avoid token limits

            Please provide a JSON response with the following structure:
            {{
                "summary_en": "Detailed English summary of the document content and key points",
                "summary_ml": "Detailed Malayalam summary of the document (if possible, otherwise leave empty)",
                "tags": ["tag1", "tag2", "tag3"],
                "primary_language": "{primary_language}",
                "sensitivity_level": "LOW|MEDIUM|HIGH|CONFIDENTIAL",
                "document_type": "contract|policy|report|invoice|memo|other",
                "key_entities": ["entity1", "entity2"],
                "recommended_roles": {{
                    "roles": ["LEADERSHIP", "HR", "FINANCE", "ENGINEER"],
                    "confidence": 0.85,
                    "reasoning": "Explanation for role assignment"
                }},
                "retention_recommendation": {{
                    "days": 2555,
                    "reason": "Legal/business justification"
                }}
            }}

            Guidelines:
            - Provide a detailed summary covering the main topics, purpose, and key information
            - For Malayalam summary, translate key points if the document is in English
            - Sensitivity levels: LOW (public info), MEDIUM (internal), HIGH (sensitive), CONFIDENTIAL (restricted)
            - Assign roles based on document content relevance
            - Consider KMRL (Kochi Metro) context for all analysis
            """

            logger.info("Sending request to DeepSeek V2 AI")
            try:
                response_text = call_deepseek_api([
                    {"role": "system", "content": "You are an expert document analysis AI for Kochi Metro Rail Limited (KMRL). Provide comprehensive analysis in the exact JSON format requested."},
                    {"role": "user", "content": prompt}
                ], max_tokens=4000, temperature=0.3)
                
                if response_text:
                    logger.info(f"Received response from DeepSeek V2 AI: {len(response_text)} characters")
                else:
                    raise Exception("No response from DeepSeek API")
                    
            except Exception as deepseek_error:
                logger.error(f"DeepSeek API error: {str(deepseek_error)}")
                logger.error(f"Error type: {type(deepseek_error).__name__}")
                if "quota" in str(deepseek_error).lower() or "limit" in str(deepseek_error).lower():
                    logger.error("DeepSeek API quota exceeded")
                elif "permission" in str(deepseek_error).lower() or "unauthorized" in str(deepseek_error).lower():
                    logger.error("DeepSeek API authentication failed")
                elif "timeout" in str(deepseek_error).lower():
                    logger.error("DeepSeek API timeout")
                else:
                    logger.error(f"Unknown DeepSeek API error: {deepseek_error}")
                return self._generate_fallback_analysis(text)
            
            # Parse JSON response
            try:
                # Clean the response text - remove markdown code blocks if present
                if response_text.startswith('```json'):
                    response_text = response_text[7:]  # Remove ```json
                if response_text.endswith('```'):
                    response_text = response_text[:-3]  # Remove ```
                response_text = response_text.strip()
                
                logger.info(f"Cleaned response text length: {len(response_text)}")
                analysis = json.loads(response_text)
                logger.info("Successfully parsed AI response as JSON")
                
                # Apply heuristic role assignment
                heuristic_roles = self._apply_role_heuristics(text)
                
                # Combine AI and heuristic results
                final_roles = self._combine_role_predictions(
                    analysis.get('recommended_roles', {}),
                    heuristic_roles
                )
                
                analysis['recommended_roles'] = final_roles
                logger.info("AI analysis completed successfully")
                return analysis
                
            except json.JSONDecodeError as je:
                logger.error(f"JSON parsing failed: {str(je)}")
                logger.error(f"Raw response: {response.text[:500]}...")
                # Fallback if JSON parsing fails
                return self._generate_fallback_analysis(text)
                
        except Exception as e:
            logger.error(f"AI analysis error: {str(e)}")
            logger.error(f"Error type: {type(e).__name__}")
            import traceback
            traceback.print_exc()
            return self._generate_fallback_analysis(text)
    
    def _apply_role_heuristics(self, text: str) -> Dict:
        """Apply keyword-based heuristics for role assignment."""
        text_lower = text.lower()
        role_scores = {}
        
        for role, keywords in self.role_keywords.items():
            score = sum(1 for keyword in keywords if keyword.lower() in text_lower)
            role_scores[role] = score / len(keywords)  # Normalize
        
        # Get roles with significant scores
        threshold = 0.1
        relevant_roles = [role for role, score in role_scores.items() if score > threshold]
        
        if not relevant_roles:
            relevant_roles = ['LEADERSHIP']  # Default fallback
        
        max_score = max(role_scores.values()) if role_scores else 0.1
        confidence = min(max_score * 2, 1.0)  # Scale confidence
        
        return {
            'roles': relevant_roles,
            'confidence': confidence,
            'reasoning': f"Keyword-based analysis identified relevance to: {', '.join(relevant_roles)}"
        }
    
    def _combine_role_predictions(self, ai_prediction: Dict, heuristic_prediction: Dict) -> Dict:
        """Combine AI and heuristic role predictions."""
        ai_roles = set(ai_prediction.get('roles', []))
        heuristic_roles = set(heuristic_prediction.get('roles', []))
        
        # Union of both predictions
        combined_roles = list(ai_roles.union(heuristic_roles))
        
        # Average confidence
        ai_confidence = ai_prediction.get('confidence', 0.5)
        heuristic_confidence = heuristic_prediction.get('confidence', 0.5)
        combined_confidence = (ai_confidence + heuristic_confidence) / 2
        
        return {
            'roles': combined_roles,
            'confidence': combined_confidence,
            'reasoning': f"Combined AI and heuristic analysis. AI suggested: {list(ai_roles)}, Heuristics suggested: {list(heuristic_roles)}"
        }
    
    def _generate_fallback_analysis(self, text: str) -> Dict:
        """Generate enhanced fallback analysis when AI fails."""
        logger.warning("Using enhanced fallback analysis - AI analysis failed")
        heuristic_roles = self._apply_role_heuristics(text)
        
        # Extract key information for better summary
        words = text.split()
        sentences = [s.strip() for s in text.split('.') if s.strip()]
        
        # Enhanced keyword extraction
        common_words = {'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'this', 'that', 'these', 'those', 'they', 'them', 'their', 'there', 'where', 'when', 'what', 'who', 'why', 'how'}
        significant_words = [word.lower().strip('.,!?;:()[]{}"-') for word in words if word.lower() not in common_words and len(word) > 3 and word.isalpha()]
        
        # Get word frequency and filter out less meaningful words
        from collections import Counter
        word_freq = Counter(significant_words)
        top_keywords = [word for word, count in word_freq.most_common(8) if count > 1]
        
        # Detect document type based on content
        text_lower = text.lower()
        doc_type = 'other'
        
        if any(term in text_lower for term in ['contract', 'agreement', 'terms', 'conditions']):
            doc_type = 'contract'
        elif any(term in text_lower for term in ['policy', 'procedure', 'guideline', 'rules']):
            doc_type = 'policy'
        elif any(term in text_lower for term in ['report', 'analysis', 'findings', 'conclusions']):
            doc_type = 'report'
        elif any(term in text_lower for term in ['invoice', 'bill', 'payment', 'amount', 'total']):
            doc_type = 'invoice'
        elif any(term in text_lower for term in ['memo', 'memorandum', 'notice', 'announcement']):
            doc_type = 'memo'
        
        # Enhanced summary generation
        # Try to find the most informative sentences
        important_sentences = []
        for sentence in sentences[:10]:  # Check first 10 sentences
            if any(keyword in sentence.lower() for keyword in top_keywords[:5]):
                important_sentences.append(sentence)
            if len(important_sentences) >= 3:
                break
        
        if not important_sentences:
            important_sentences = sentences[:3]
        
        # Create structured summary
        if doc_type == 'contract':
            summary_template = f"Contract/Agreement document concerning {', '.join(top_keywords[:3])}. "
        elif doc_type == 'policy':
            summary_template = f"Policy document addressing {', '.join(top_keywords[:3])}. "
        elif doc_type == 'report':
            summary_template = f"Report analyzing {', '.join(top_keywords[:3])}. "
        elif doc_type == 'invoice':
            summary_template = f"Financial document (invoice/bill) related to {', '.join(top_keywords[:3])}. "
        elif doc_type == 'memo':
            summary_template = f"Memo/Notice regarding {', '.join(top_keywords[:3])}. "
        else:
            summary_template = f"Document discussing {', '.join(top_keywords[:3])}. "
        
        key_content = ' '.join(important_sentences)[:300]
        summary = f"{summary_template}{key_content}... Document contains {len(words)} words and covers topics including: {', '.join(top_keywords[:5])}."
        
        # Determine sensitivity based on content keywords and document type
        sensitivity = 'MEDIUM'  # Default
        
        if any(word in text_lower for word in ['confidential', 'restricted', 'classified', 'secret', 'private', 'sensitive']):
            sensitivity = 'CONFIDENTIAL'
        elif any(word in text_lower for word in ['internal', 'limited', 'proprietary', 'draft']) or doc_type in ['contract']:
            sensitivity = 'HIGH'
        elif any(word in text_lower for word in ['public', 'announcement', 'press', 'general', 'open']) or doc_type in ['memo']:
            sensitivity = 'LOW'
        
        # Enhanced tags based on content and document type
        base_tags = [doc_type] if doc_type != 'other' else []
        content_tags = []
        
        # Add domain-specific tags
        if any(term in text_lower for term in ['metro', 'railway', 'train', 'station', 'transport']):
            content_tags.append('transportation')
        if any(term in text_lower for term in ['finance', 'budget', 'cost', 'payment', 'money']):
            content_tags.append('finance')
        if any(term in text_lower for term in ['safety', 'security', 'emergency', 'risk']):
            content_tags.append('safety')
        if any(term in text_lower for term in ['project', 'construction', 'development', 'engineering']):
            content_tags.append('engineering')
        if any(term in text_lower for term in ['staff', 'employee', 'personnel', 'human', 'resource']):
            content_tags.append('hr')
        
        all_tags = base_tags + content_tags + top_keywords[:3]
        
        # Improve confidence for fallback based on content analysis
        base_confidence = heuristic_roles.get('confidence', 0.6)
        
        # Increase confidence if we have clear document type or domain keywords
        if doc_type != 'other':
            base_confidence = min(base_confidence + 0.15, 0.85)
        if content_tags:
            base_confidence = min(base_confidence + 0.1, 0.85)
        
        return {
            'summary_en': summary,
            'summary_ml': "",  # Could be enhanced with translation logic
            'tags': list(set(all_tags))[:8],  # Remove duplicates and limit
            'primary_language': self.detect_language(text),
            'sensitivity_level': sensitivity,
            'document_type': doc_type,
            'key_entities': top_keywords[:6],
            'recommended_roles': {
                'roles': heuristic_roles.get('roles', ['LEADERSHIP']),
                'confidence': base_confidence,
                'reasoning': f"Enhanced heuristic analysis identified {doc_type} document with {sensitivity.lower()} sensitivity. Key topics: {', '.join(top_keywords[:3])}"
            },
            'retention_recommendation': {
                'days': 2555 if doc_type in ['contract', 'policy'] else 1825,
                'reason': f'Standard retention for {doc_type} documents based on KMRL policy'
            }
        }
    
    def generate_embeddings(self, text: str) -> List[float]:
        """Generate simple TF-IDF embeddings for semantic search."""
        try:
            # For prototype, use simple TF-IDF
            # In production, consider using sentence transformers or similar
            vectorizer = TfidfVectorizer(max_features=512, stop_words='english')
            
            # Fit on the current text (in production, fit on larger corpus)
            tfidf_matrix = vectorizer.fit_transform([text])
            embeddings = tfidf_matrix.toarray()[0].tolist()
            
            return embeddings
        except Exception as e:
            logger.error(f"Embedding generation error: {str(e)}")
            return [0.0] * 512  # Return zero vector as fallback

# Initialize processor
processor = DocumentProcessor()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/process-document', methods=['POST'])
def process_document():
    """Process uploaded document and return AI analysis."""
    try:
        data = request.json
        file_path = data.get('file_path')
        mime_type = data.get('mime_type')
        
        if not file_path or not mime_type:
            return jsonify({'error': 'file_path and mime_type are required'}), 400
        
        # Extract text
        extracted_text = processor.extract_text_from_file(file_path, mime_type)
        
        if not extracted_text.strip():
            return jsonify({'error': 'No text could be extracted from the document'}), 400
        
        # Generate AI analysis
        analysis = processor.generate_ai_analysis(extracted_text)
        
        # Generate embeddings
        embeddings = processor.generate_embeddings(extracted_text)
        
        # Combine results
        result = {
            'extracted_text': extracted_text,
            'analysis': analysis,
            'embeddings': embeddings,
            'processing_timestamp': datetime.now().isoformat()
        }
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Document processing error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/chat/document', methods=['POST'])
def chat_with_document():
    """Chat with a specific document."""
    try:
        data = request.json
        document_text = data.get('document_text')
        user_question = data.get('question')
        language = data.get('language', 'en')
        
        if not document_text or not user_question:
            return jsonify({'error': 'document_text and question are required'}), 400
        
        # Create chat prompt
        prompt = f"""
        You are an AI assistant helping users understand documents for Kochi Metro Rail Limited (KMRL).
        
        Document Context:
        {document_text[:3000]}
        
        User Question: {user_question}
        
        Please provide a helpful answer based on the document content. 
        Response language: {'Malayalam' if language == 'ml' else 'English'}
        
        If the question cannot be answered from the document, say so clearly.
        """
        
        response_text = call_deepseek_api([
            {"role": "system", "content": "You are an AI assistant helping users understand documents for Kochi Metro Rail Limited (KMRL). Provide helpful and accurate answers based on the document content."},
            {"role": "user", "content": prompt}
        ], max_tokens=2000, temperature=0.3)
        
        if not response_text:
            response_text = "I apologize, but I'm unable to process your question at the moment. Please try again later."
        
        return jsonify({
            'answer': response_text,
            'language': language,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Document chat error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/chat/search', methods=['POST'])
def semantic_search():
    """Perform semantic search across documents."""
    try:
        data = request.json
        query = data.get('query')
        user_roles = data.get('user_roles', [])
        limit = data.get('limit', 10)
        
        if not query:
            return jsonify({'error': 'query is required'}), 400
        
        # Connect to database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get documents accessible to user
        role_filter = "AND allowed_roles ?| %s" if user_roles else ""
        
        cursor.execute(f"""
            SELECT id, filename, summary_en, summary_ml, tags, embeddings, allowed_roles
            FROM documents 
            WHERE status = 'ACTIVE' {role_filter}
            ORDER BY created_at DESC
            LIMIT %s
        """, (user_roles, limit) if user_roles else (limit,))
        
        documents = cursor.fetchall()
        
        if not documents:
            return jsonify({'results': []})
        
        # Generate query embedding
        query_embedding = processor.generate_embeddings(query)
        
        # Calculate similarities
        results = []
        for doc in documents:
            doc_embeddings = doc['embeddings']
            if doc_embeddings:
                # Calculate cosine similarity
                similarity = cosine_similarity(
                    [query_embedding],
                    [doc_embeddings]
                )[0][0]
                
                results.append({
                    'document_id': doc['id'],
                    'filename': doc['filename'],
                    'summary_en': doc['summary_en'],
                    'summary_ml': doc['summary_ml'],
                    'tags': doc['tags'],
                    'similarity_score': float(similarity),
                    'allowed_roles': doc['allowed_roles']
                })
        
        # Sort by similarity
        results.sort(key=lambda x: x['similarity_score'], reverse=True)
        
        conn.close()
        
        return jsonify({
            'results': results[:limit],
            'query': query,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Semantic search error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/chat/global', methods=['POST'])
def global_chat():
    """Enhanced chat across multiple documents with comprehensive analysis."""
    try:
        data = request.json
        user_question = data.get('query') or data.get('question')  # Support both field names
        user_roles = data.get('user_roles', [])
        language = data.get('language', 'en')
        
        if not user_question:
            return jsonify({'error': 'question is required'}), 400
        
        logger.info(f"Global chat query: {user_question[:100]}... Language: {language}")
        
        # Connect to database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get documents accessible to user with more comprehensive filtering
        role_filter = ""
        params = []
        
        if user_roles:
            # Create role filter for JSON array
            role_conditions = []
            for role in user_roles:
                role_conditions.append("allowed_roles::text LIKE %s")
                params.append(f'%"{role}"%')
            role_filter = f"AND ({' OR '.join(role_conditions)})"
        
        # Get all relevant documents with full content
        query = f"""
            SELECT id, filename, summary_en, summary_ml, tags, embeddings, 
                   allowed_roles, sensitivity_level, status,
                   created_at, file_size
            FROM documents 
            WHERE status = 'ACTIVE' {role_filter}
            ORDER BY created_at DESC
            LIMIT 50
        """
        
        cursor.execute(query, params)
        documents = cursor.fetchall()
        
        if not documents:
            return jsonify({
                'answer': 'No accessible documents found for your role.' if language == 'en' 
                         else 'നിങ്ങളുടെ റോളിന് ആക്സസ് ചെയ്യാവുന്ന ഡോക്യുമെന്റുകൾ കണ്ടെത്തിയില്ല.',
                'relevant_documents': [],
                'language': language,
                'timestamp': datetime.now().isoformat()
            })
        
        # Enhanced semantic search for relevance
        processor = DocumentProcessor()
        query_embedding = processor.generate_embeddings(user_question)
        
        relevant_docs = []
        
        # Check if this is a general listing query
        listing_keywords = ['list', 'show', 'all documents', 'what documents', 'available documents', 'document list']
        is_listing_query = any(keyword in user_question.lower() for keyword in listing_keywords)
        
        for doc in documents:
            if doc['embeddings']:
                try:
                    doc_embedding = np.array(json.loads(doc['embeddings']))
                    similarity = cosine_similarity([query_embedding], [doc_embedding])[0][0]
                    
                    # For listing queries, include all documents with lower threshold
                    # For specific queries, use higher threshold
                    threshold = 0.05 if is_listing_query else 0.15
                    
                    if similarity > threshold or is_listing_query:
                        relevant_docs.append({
                            'id': doc['id'],
                            'filename': doc['filename'],
                            'summary_en': doc['summary_en'],
                            'summary_ml': doc['summary_ml'],
                            'tags': doc['tags'] or [],
                            'similarity_score': float(similarity),
                            'allowed_roles': doc['allowed_roles'],
                            'sensitivity_level': doc['sensitivity_level'],
                            'status': doc['status'],
                            'created_at': doc['created_at'].isoformat() if doc['created_at'] else None,
                            'file_size': doc['file_size']
                        })
                except:
                    # If embeddings fail, include all documents for listing queries
                    if is_listing_query:
                        relevant_docs.append({
                            'id': doc['id'],
                            'filename': doc['filename'],
                            'summary_en': doc['summary_en'],
                            'summary_ml': doc['summary_ml'],
                            'tags': doc['tags'] or [],
                            'similarity_score': 0.5,  # Default score
                            'allowed_roles': doc['allowed_roles'],
                            'sensitivity_level': doc['sensitivity_level'],
                            'status': doc['status'],
                            'created_at': doc['created_at'].isoformat() if doc['created_at'] else None,
                            'file_size': doc['file_size']
                        })
                    continue
        
        # Sort by relevance
        relevant_docs.sort(key=lambda x: x['similarity_score'], reverse=True)
        
        # Limit to top 10 most relevant documents for context
        top_docs = relevant_docs[:10]
        
        # Create comprehensive context
        context_parts = []
        document_stats = {
            'total_documents': len(documents),
            'relevant_documents': len(relevant_docs),
            'sensitivity_levels': {},
            'document_types': {},
            'recent_documents': 0
        }
        
        # Analyze document statistics
        from datetime import datetime, timedelta
        recent_cutoff = datetime.now() - timedelta(days=30)
        
        for doc in documents:
            # Count sensitivity levels
            sens_level = doc['sensitivity_level'] or 'UNKNOWN'
            document_stats['sensitivity_levels'][sens_level] = document_stats['sensitivity_levels'].get(sens_level, 0) + 1
            
            # Count document types (use generic types based on filename)
            filename = doc['filename'].lower()
            if any(ext in filename for ext in ['.pdf', '.doc', '.docx']):
                doc_type = 'document'
            elif any(ext in filename for ext in ['.xls', '.xlsx', '.csv']):
                doc_type = 'spreadsheet'
            elif any(ext in filename for ext in ['.ppt', '.pptx']):
                doc_type = 'presentation'
            else:
                doc_type = 'other'
            
            document_stats['document_types'][doc_type] = document_stats['document_types'].get(doc_type, 0) + 1
            
            # Count recent documents
            if doc['created_at'] and doc['created_at'] > recent_cutoff:
                document_stats['recent_documents'] += 1
        
        for i, doc in enumerate(top_docs[:5]):  # Include top 5 in context
            context_parts.append(f"""
Document {i+1}: {doc['filename']}
Status: {doc['status']}
Sensitivity: {doc['sensitivity_level']}
Summary: {doc['summary_en']}
Tags: {', '.join(doc['tags'][:5])}
            """.strip())
        
        context = "\n\n".join(context_parts)
        
        # Enhanced prompt for comprehensive analysis
        stats_summary = f"""
Total accessible documents: {document_stats['total_documents']}
Relevant to query: {document_stats['relevant_documents']}
Recent documents (last 30 days): {document_stats['recent_documents']}
Sensitivity distribution: {', '.join([f"{k}: {v}" for k, v in document_stats['sensitivity_levels'].items()])}
Document types: {', '.join([f"{k}: {v}" for k, v in document_stats['document_types'].items()])}
        """
        
        prompt = f"""
You are an advanced AI assistant for Kochi Metro Rail Limited (KMRL) document management system.
You have access to {document_stats['total_documents']} documents and found {document_stats['relevant_documents']} relevant to the user's query.

DOCUMENT COLLECTION OVERVIEW:
{stats_summary}

MOST RELEVANT DOCUMENTS:
{context}

USER QUESTION: {user_question}

INSTRUCTIONS:
1. Provide a comprehensive answer based on the available documents
2. Reference specific documents when relevant
3. If analyzing trends, provide insights across multiple documents
4. If the question is general, provide an overview of the document collection
5. Mention document types, sensitivity levels, or time periods when relevant
6. Response language: {'Malayalam' if language == 'ml' else 'English'}
7. Be thorough but concise, highlighting key findings and patterns
8. If information is not available, clearly state this and suggest what type of documents might contain the answer

Format your response in a clear, structured manner with relevant details and document references.
        """
        
        logger.info("Sending enhanced global query to DeepSeek V2 AI")
        try:
            response_text = call_deepseek_api([
                {"role": "system", "content": "You are an advanced AI assistant for Kochi Metro Rail Limited (KMRL) document management system. Provide comprehensive and accurate analysis based on the document collection."},
                {"role": "user", "content": prompt}
            ], max_tokens=4000, temperature=0.3)
            
            if response_text:
                logger.info(f"Received global analysis response: {len(response_text)} characters")
            else:
                raise Exception("No response from DeepSeek API")
            
            # Clean markdown if present
            if response_text.startswith('```'):
                # Remove any markdown formatting
                lines = response_text.split('\n')
                response_text = '\n'.join([line for line in lines if not line.strip().startswith('```')])
            
            conn.close()
            
            return jsonify({
                'answer': response_text,
                'relevant_documents': top_docs,
                'document_stats': document_stats,
                'language': language,
                'timestamp': datetime.now().isoformat()
            })
            
        except Exception as deepseek_error:
            logger.error(f"DeepSeek API error in global chat: {str(deepseek_error)}")
            # Fallback response
            fallback_answer = f"""
Based on analysis of {document_stats['total_documents']} accessible documents, I found {document_stats['relevant_documents']} documents relevant to your query.

Recent activity: {document_stats['recent_documents']} documents uploaded in the last 30 days.

Document distribution:
- Sensitivity levels: {', '.join([f"{k}: {v}" for k, v in document_stats['sensitivity_levels'].items()])}
- Document types: {', '.join([f"{k}: {v}" for k, v in document_stats['document_types'].items()])}

Most relevant documents for your query "{user_question}":
{chr(10).join([f"• {doc['filename']} (Status: {doc['status']})" for doc in top_docs[:5]])}

AI analysis temporarily unavailable. Please check individual documents for detailed information.
            """ if language == 'en' else f"""
നിങ്ങളുടെ ക്വറിയുമായി ബന്ധപ്പെട്ട് {document_stats['total_documents']} ആക്സസ് ചെയ്യാവുന്ന ഡോക്യുമെന്റുകളിൽ നിന്ന് {document_stats['relevant_documents']} പ്രസക്തമായ ഡോക്യുമെന്റുകൾ കണ്ടെത്തി.

കഴിഞ്ഞ 30 ദിവസത്തിനുള്ളിൽ: {document_stats['recent_documents']} ഡോക്യുമെന്റുകൾ അപ്‌ലോഡ് ചെയ്തു.

വിശദമായ വിവരങ്ങൾക്ക് വ്യക്തിഗത ഡോക്യുമെന്റുകൾ പരിശോധിക്കുക.
            """
            
            return jsonify({
                'answer': fallback_answer,
                'relevant_documents': top_docs,
                'document_stats': document_stats,
                'language': language,
                'timestamp': datetime.now().isoformat()
            })
        
    except Exception as e:
        logger.error(f"Global chat error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('FLASK_PORT', 5000)),
        debug=True
    )
