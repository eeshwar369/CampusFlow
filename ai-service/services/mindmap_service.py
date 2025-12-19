import re
from typing import List, Dict

class MindMapService:
    def __init__(self):
        print("MindMapService initialized")
    
    def generate_mindmap(self, text: str) -> Dict:
        """
        Generate mind map structure from text content
        """
        # Extract topics and subtopics
        topics = self.extract_topics(text)
        
        # Extract key concepts
        key_concepts = self.extract_key_concepts(text)
        
        return {
            'topics': topics,
            'key_concepts': key_concepts
        }
    
    def extract_topics(self, text: str) -> List[Dict]:
        """
        Extract main topics and subtopics from text
        """
        topics = []
        
        # Split text into sections
        lines = text.split('\n')
        current_topic = None
        current_subtopics = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Check if line is a main topic
            if self.is_main_topic(line):
                # Save previous topic if exists
                if current_topic:
                    topics.append({
                        'name': current_topic,
                        'subtopics': current_subtopics,
                        'description': f'Study materials and concepts related to {current_topic}'
                    })
                
                # Start new topic
                current_topic = self.clean_topic_name(line)
                current_subtopics = []
            
            # Check if line is a subtopic
            elif current_topic and self.is_subtopic(line):
                subtopic = self.clean_topic_name(line)
                if subtopic and len(subtopic) > 3:
                    current_subtopics.append(subtopic)
        
        # Add last topic
        if current_topic:
            topics.append({
                'name': current_topic,
                'subtopics': current_subtopics,
                'description': f'Study materials and concepts related to {current_topic}'
            })
        
        # If no topics found, create generic structure
        if not topics:
            topics = self.create_generic_topics(text)
        
        return topics
    
    def is_main_topic(self, line: str) -> bool:
        """Check if line is a main topic"""
        # Check for numbered sections
        if re.match(r'^(\d+\.|\d+\)|\w+\s+\d+|Unit\s+\d+|Chapter\s+\d+|Module\s+\d+)', line, re.IGNORECASE):
            return True
        
        # Check if line is all caps or title case
        if line.isupper() and 5 < len(line) < 100:
            return True
        
        # Check for topic keywords
        topic_keywords = ['introduction', 'overview', 'fundamentals', 'basics', 'advanced', 'concepts']
        if any(keyword in line.lower() for keyword in topic_keywords):
            return True
        
        return False
    
    def is_subtopic(self, line: str) -> bool:
        """Check if line is a subtopic"""
        # Check for bullet points or sub-numbering
        if re.match(r'^(\s*[-•*]|\s*\d+\.\d+|\s*[a-z]\)|\s*[ivx]+\.)', line, re.IGNORECASE):
            return True
        
        # Check if line starts with common subtopic indicators
        if re.match(r'^\s*(Definition|Types|Examples|Applications|Properties)', line, re.IGNORECASE):
            return True
        
        return False
    
    def clean_topic_name(self, text: str) -> str:
        """Clean and format topic name"""
        # Remove numbering
        text = re.sub(r'^(\d+\.|\d+\)|\w+\s+\d+|Unit\s+\d+|Chapter\s+\d+|Module\s+\d+)\s*', '', text, flags=re.IGNORECASE)
        
        # Remove bullet points
        text = re.sub(r'^(\s*[-•*]|\s*[a-z]\)|\s*[ivx]+\.)\s*', '', text, flags=re.IGNORECASE)
        
        # Clean up whitespace
        text = ' '.join(text.split())
        
        # Capitalize properly
        if text.isupper():
            text = text.title()
        
        return text.strip()
    
    def create_generic_topics(self, text: str) -> List[Dict]:
        """Create generic topic structure when no clear structure found"""
        # Extract sentences
        sentences = [s.strip() for s in text.split('.') if len(s.strip()) > 20]
        
        # Group sentences into topics
        topics = []
        for i in range(0, min(len(sentences), 30), 5):
            topic_sentences = sentences[i:i+5]
            if topic_sentences:
                topic_name = topic_sentences[0][:100]
                topics.append({
                    'name': topic_name,
                    'subtopics': topic_sentences[1:4] if len(topic_sentences) > 1 else [],
                    'description': 'Extracted from syllabus content'
                })
        
        return topics[:10]
    
    def extract_key_concepts(self, text: str) -> List[Dict]:
        """Extract key concepts from text"""
        concepts = []
        
        # Look for definition patterns
        definition_patterns = [
            r'(\w+(?:\s+\w+){0,3})\s+is\s+(?:a|an|the)\s+([^.]+)',
            r'(\w+(?:\s+\w+){0,3})\s+refers to\s+([^.]+)',
            r'(\w+(?:\s+\w+){0,3})\s+means\s+([^.]+)'
        ]
        
        for pattern in definition_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                concept_name = match.group(1).strip()
                description = match.group(2).strip()
                
                if len(concept_name) > 3 and len(description) > 10:
                    concepts.append({
                        'name': concept_name.title(),
                        'description': description[:200]
                    })
        
        return concepts[:15]
    
    def link_resources(self, topics: List[Dict]) -> List[Dict]:
        """Generate study resource links for topics"""
        resources = []
        
        for topic in topics[:10]:
            topic_name = topic.get('name', '')
            if not topic_name:
                continue
            
            topic_resources = {
                'topic': topic_name,
                'links': [
                    {
                        'type': 'video',
                        'title': f'Video Tutorial: {topic_name}',
                        'url': f"https://www.youtube.com/results?search_query={topic_name.replace(' ', '+')}"
                    },
                    {
                        'type': 'article',
                        'title': f'{topic_name} - Wikipedia',
                        'url': f"https://en.wikipedia.org/wiki/{topic_name.replace(' ', '_')}"
                    },
                    {
                        'type': 'tutorial',
                        'title': f'Learn {topic_name} - GeeksforGeeks',
                        'url': f"https://www.geeksforgeeks.org/{topic_name.lower().replace(' ', '-')}/"
                    }
                ]
            }
            resources.append(topic_resources)
        
        return resources
