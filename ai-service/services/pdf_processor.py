import PyPDF2
import re

class PDFProcessor:
    def extract_text(self, pdf_path):
        """Extract text from PDF file"""
        try:
            text = ""
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text()
            
            # Clean text
            text = self.clean_text(text)
            return text
        
        except Exception as e:
            raise Exception(f"Error extracting PDF text: {str(e)}")
    
    def clean_text(self, text):
        """Clean extracted text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep basic punctuation
        text = re.sub(r'[^\w\s.,;:()\-]', '', text)
        
        return text.strip()
    
    def extract_topics(self, text):
        """Extract topics from text"""
        # Simple topic extraction based on common patterns
        topics = []
        
        # Look for numbered sections (1., 2., etc.)
        numbered_pattern = r'(\d+\.)\s+([A-Z][^.]+)'
        matches = re.findall(numbered_pattern, text)
        for match in matches:
            topics.append(match[1].strip())
        
        # Look for bullet points
        bullet_pattern = r'[•\-]\s+([A-Z][^.]+)'
        matches = re.findall(bullet_pattern, text)
        for match in matches:
            topics.append(match.strip())
        
        return topics
