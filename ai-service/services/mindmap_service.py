import re
from typing import List, Dict

class MindMapService:
    def __init__(self):
        print("MindMapService initialized")
    
    def generate_mindmap(self, text: str) -> Dict:
        """
        Generate mind map structure from text content with intelligent extraction
        """
        # Clean and preprocess text
        text = self.preprocess_text(text)
        
        # Extract course information
        course_info = self.extract_course_info(text)
        
        # Extract topics and subtopics with better intelligence
        topics = self.extract_topics(text)
        
        # Extract key concepts
        key_concepts = self.extract_key_concepts(text)
        
        # Filter and limit to most important content
        topics = self.filter_important_topics(topics)
        
        return {
            'course_info': course_info,
            'topics': topics,
            'key_concepts': key_concepts[:10]  # Limit to top 10 concepts
        }
    
    def preprocess_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove page numbers
        text = re.sub(r'\bPage\s+\d+\b', '', text, flags=re.IGNORECASE)
        # Remove common headers/footers
        text = re.sub(r'\b(Syllabus|Course Outline|Table of Contents)\b', '', text, flags=re.IGNORECASE)
        return text.strip()
    
    def extract_course_info(self, text: str) -> Dict:
        """Extract course title and description"""
        lines = text.split('.')[:5]  # First few sentences
        
        # Try to find course name patterns
        course_patterns = [
            r'(?:Course|Subject|Module)[\s:]+([A-Z][^.]+)',
            r'^([A-Z][A-Za-z\s&]+(?:I{1,3}|[0-9]{3}))',
            r'([A-Z][A-Za-z\s]+(?:Fundamentals|Basics|Introduction|Advanced))'
        ]
        
        title = "Course Overview"
        for pattern in course_patterns:
            match = re.search(pattern, text[:500])
            if match:
                title = match.group(1).strip()
                break
        
        return {
            'title': title[:100],
            'description': 'Click on the root node to explore topics and subtopics'
        }
    
    def extract_topics(self, text: str) -> List[Dict]:
        """
        Intelligently extract main topics and subtopics
        """
        topics = []
        lines = text.split('\n')
        
        current_topic = None
        current_subtopics = []
        topic_count = 0
        
        for i, line in enumerate(lines):
            line = line.strip()
            if not line or len(line) < 5:
                continue
            
            # Check if line is a main topic (Unit, Chapter, Module, etc.)
            if self.is_main_topic(line):
                # Save previous topic
                if current_topic and topic_count < 15:  # Limit to 15 topics
                    topics.append({
                        'name': current_topic,
                        'subtopics': current_subtopics[:8],  # Limit to 8 subtopics
                        'description': self.generate_topic_description(current_topic)
                    })
                    topic_count += 1
                
                # Start new topic
                current_topic = self.clean_topic_name(line)
                current_subtopics = []
            
            # Check if line is a subtopic
            elif current_topic and self.is_subtopic(line):
                subtopic = self.clean_topic_name(line)
                if subtopic and 5 < len(subtopic) < 100 and len(current_subtopics) < 8:
                    # Avoid duplicates
                    if subtopic not in current_subtopics:
                        current_subtopics.append(subtopic)
        
        # Add last topic
        if current_topic and topic_count < 15:
            topics.append({
                'name': current_topic,
                'subtopics': current_subtopics[:8],
                'description': self.generate_topic_description(current_topic)
            })
        
        # If no topics found, use intelligent extraction
        if not topics:
            topics = self.intelligent_topic_extraction(text)
        
        return topics[:15]  # Maximum 15 topics
    
    def filter_important_topics(self, topics: List[Dict]) -> List[Dict]:
        """Filter out noise and keep only meaningful topics"""
        filtered = []
        
        # Keywords to avoid
        noise_keywords = ['page', 'reference', 'bibliography', 'index', 'appendix', 
                         'table of contents', 'preface', 'acknowledgment']
        
        for topic in topics:
            topic_lower = topic['name'].lower()
            
            # Skip if contains noise keywords
            if any(keyword in topic_lower for keyword in noise_keywords):
                continue
            
            # Skip if too short or too long
            if len(topic['name']) < 5 or len(topic['name']) > 150:
                continue
            
            # Skip if no subtopics and description is generic
            if not topic.get('subtopics') and 'Study materials' in topic.get('description', ''):
                continue
            
            filtered.append(topic)
        
        return filtered
    
    def intelligent_topic_extraction(self, text: str) -> List[Dict]:
        """
        Use intelligent patterns to extract topics when standard methods fail
        """
        topics = []
        
        # Look for numbered sections
        numbered_pattern = r'(?:^|\n)(\d+\.?\s+)([A-Z][^.\n]{10,100})'
        matches = re.findall(numbered_pattern, text)
        
        for i, (num, topic_name) in enumerate(matches[:15]):
            if i < 15:
                topics.append({
                    'name': topic_name.strip(),
                    'subtopics': [],
                    'description': f'Key concepts and learning objectives for {topic_name.strip()}'
                })
        
        # If still no topics, extract from headings
        if not topics:
            heading_pattern = r'(?:^|\n)([A-Z][A-Za-z\s]{10,80})(?:\n|:)'
            headings = re.findall(heading_pattern, text)
            
            for heading in headings[:10]:
                if len(heading.strip()) > 10:
                    topics.append({
                        'name': heading.strip(),
                        'subtopics': [],
                        'description': f'Important topic covering {heading.strip()}'
                    })
        
        return topics
    
    def generate_topic_description(self, topic_name: str) -> str:
        """Generate meaningful description for a topic"""
        descriptions = {
            'introduction': 'Foundational concepts and overview',
            'fundamental': 'Core principles and basic concepts',
            'advanced': 'In-depth study and complex applications',
            'application': 'Practical implementation and use cases',
            'theory': 'Theoretical foundations and principles',
            'practical': 'Hands-on exercises and real-world examples'
        }
        
        topic_lower = topic_name.lower()
        for keyword, desc in descriptions.items():
            if keyword in topic_lower:
                return desc
        
        return f'Key concepts and learning objectives for {topic_name}'
    
    def is_main_topic(self, line: str) -> bool:
        """Check if line is a main topic with better detection"""
        # Skip if too short or too long
        if len(line) < 5 or len(line) > 150:
            return False
        
        # Check for numbered sections (1., 1.0, Unit 1, Chapter 1, etc.)
        if re.match(r'^(\d+\.?\d*\s+|Unit\s+\d+|Chapter\s+\d+|Module\s+\d+|Lesson\s+\d+|Topic\s+\d+)', line, re.IGNORECASE):
            return True
        
        # Check if line is title case or all caps (but not too long)
        words = line.split()
        if len(words) >= 2 and len(words) <= 15:
            # Title case check
            if all(word[0].isupper() for word in words if len(word) > 2):
                return True
            
            # All caps check (but reasonable length)
            if line.isupper() and 10 < len(line) < 80:
                return True
        
        # Check for topic keywords at start
        topic_keywords = [
            'Introduction to', 'Overview of', 'Fundamentals of', 'Basics of',
            'Advanced', 'Understanding', 'Exploring', 'Concepts of'
        ]
        if any(line.startswith(keyword) for keyword in topic_keywords):
            return True
        
        return False
    
    def is_subtopic(self, line: str) -> bool:
        """Check if line is a subtopic with better detection"""
        # Skip if too short or too long
        if len(line) < 5 or len(line) > 120:
            return False
        
        # Check for bullet points or sub-numbering
        if re.match(r'^(\s*[-•*○●▪▫]|\s*\d+\.\d+|\s*[a-z]\)|\s*[ivx]+\.|\s*\([a-z]\))', line, re.IGNORECASE):
            return True
        
        # Check if line starts with common subtopic indicators
        subtopic_indicators = [
            'Definition', 'Types', 'Examples', 'Applications', 'Properties',
            'Characteristics', 'Features', 'Methods', 'Techniques', 'Principles',
            'Components', 'Elements', 'Factors', 'Advantages', 'Disadvantages'
        ]
        if any(line.startswith(indicator) for indicator in subtopic_indicators):
            return True
        
        # Check for indented text (starts with spaces)
        if line.startswith('    ') or line.startswith('\t'):
            return True
        
        return False
    
    def clean_topic_name(self, text: str) -> str:
        """Clean and format topic name"""
        # Remove numbering
        text = re.sub(r'^(\d+\.?\d*\s*|Unit\s+\d+\s*|Chapter\s+\d+\s*|Module\s+\d+\s*|Lesson\s+\d+\s*|Topic\s+\d+\s*)', '', text, flags=re.IGNORECASE)
        
        # Remove bullet points
        text = re.sub(r'^(\s*[-•*○●▪▫]|\s*[a-z]\)|\s*[ivx]+\.|\s*\([a-z]\))\s*', '', text, flags=re.IGNORECASE)
        
        # Remove special characters at start/end
        text = re.sub(r'^[:\-–—]+\s*', '', text)
        text = re.sub(r'\s*[:\-–—]+$', '', text)
        
        # Clean up whitespace
        text = ' '.join(text.split())
        
        # Capitalize properly if all caps
        if text.isupper() and len(text) > 10:
            text = text.title()
        
        # Remove trailing punctuation except period
        text = re.sub(r'[,;:]+$', '', text)
        
        return text.strip()
    
    def create_generic_topics(self, text: str) -> List[Dict]:
        """Create generic topic structure when no clear structure found"""
        # This should rarely be used now
        return []
    
    def extract_key_concepts(self, text: str) -> List[Dict]:
        """Extract key concepts and definitions from text"""
        concepts = []
        
        # Look for definition patterns
        definition_patterns = [
            r'(\w+(?:\s+\w+){0,3})\s+is\s+(?:a|an|the)\s+([^.]{10,150})',
            r'(\w+(?:\s+\w+){0,3})\s+refers to\s+([^.]{10,150})',
            r'(\w+(?:\s+\w+){0,3})\s+means\s+([^.]{10,150})',
            r'(\w+(?:\s+\w+){0,3}):\s+([A-Z][^.]{10,150})'
        ]
        
        seen_concepts = set()
        
        for pattern in definition_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                concept_name = match.group(1).strip().title()
                description = match.group(2).strip()
                
                # Skip if too generic or already seen
                if len(concept_name) < 3 or concept_name.lower() in seen_concepts:
                    continue
                
                # Skip common words
                common_words = ['this', 'that', 'these', 'those', 'it', 'the', 'a', 'an']
                if concept_name.lower() in common_words:
                    continue
                
                if 10 < len(description) < 200:
                    concepts.append({
                        'name': concept_name,
                        'description': description[:150]
                    })
                    seen_concepts.add(concept_name.lower())
                
                if len(concepts) >= 15:
                    break
            
            if len(concepts) >= 15:
                break
        
        return concepts[:10]  # Return top 10
    
    def link_resources(self, topics: List[Dict]) -> List[Dict]:
        """Generate study resource links for topics"""
        resources = []
        
        for topic in topics[:10]:  # Limit to first 10 topics
            topic_name = topic.get('name', '')
            if not topic_name or len(topic_name) < 3:
                continue
            
            # Create search-friendly topic name
            search_term = topic_name.replace(' ', '+')
            
            topic_resources = {
                'topic': topic_name,
                'links': [
                    {
                        'type': 'video',
                        'title': f'Video Tutorial: {topic_name}',
                        'url': f"https://www.youtube.com/results?search_query={search_term}+tutorial"
                    },
                    {
                        'type': 'article',
                        'title': f'{topic_name} - Wikipedia',
                        'url': f"https://en.wikipedia.org/wiki/{topic_name.replace(' ', '_')}"
                    },
                    {
                        'type': 'tutorial',
                        'title': f'Learn {topic_name}',
                        'url': f"https://www.geeksforgeeks.org/{topic_name.lower().replace(' ', '-')}/"
                    }
                ]
            }
            resources.append(topic_resources)
        
        return resources
