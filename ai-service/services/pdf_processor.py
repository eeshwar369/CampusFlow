import PyPDF2
import re

class PDFProcessor:
    def extract_text(self, pdf_path):
        """Extract text from PDF file with better structure preservation"""
        try:
            text = ""
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                
                print(f"Processing PDF with {len(pdf_reader.pages)} pages")
                
                for page_num, page in enumerate(pdf_reader.pages):
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
                
                print(f"Extracted {len(text)} characters")
            
            # Clean text while preserving structure
            text = self.clean_text(text)
            return text
        
        except Exception as e:
            raise Exception(f"Error extracting PDF text: {str(e)}")
    
    def clean_text(self, text):
        """Clean extracted text while preserving important structure"""
        # Normalize line breaks
        text = text.replace('\r\n', '\n').replace('\r', '\n')
        
        # Remove excessive blank lines (more than 2)
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        # Remove page numbers (standalone numbers)
        text = re.sub(r'\n\s*\d+\s*\n', '\n', text)
        
        # Remove common PDF artifacts
        text = re.sub(r'[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f-\x9f]', '', text)
        
        # Fix spacing around punctuation
        text = re.sub(r'\s+([.,;:!?])', r'\1', text)
        
        # Normalize multiple spaces to single space (but preserve line breaks)
        lines = text.split('\n')
        cleaned_lines = [' '.join(line.split()) for line in lines]
        text = '\n'.join(cleaned_lines)
        
        return text.strip()
    
    def extract_topics(self, text):
        """Extract topics from text - kept for backward compatibility"""
        topics = []
        
        # Look for numbered sections (1., 2., etc.)
        numbered_pattern = r'(\d+\.)\s+([A-Z][^.\n]+)'
        matches = re.findall(numbered_pattern, text)
        for match in matches:
            topics.append(match[1].strip())
        
        # Look for bullet points
        bullet_pattern = r'[•\-]\s+([A-Z][^.\n]+)'
        matches = re.findall(bullet_pattern, text)
        for match in matches:
            topics.append(match.strip())
        
        return topics[:20]  # Limit to 20 topics
