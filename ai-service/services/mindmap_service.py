import spacy
import json
from collections import defaultdict

class MindMapService:
    def __init__(self):
        try:
            self.nlp = spacy.load('en_core_web_sm')
        except:
            # If model not found, use blank model
            self.nlp = spacy.blank('en')
    
    def generate_mindmap(self, text):
        """Generate mind map structure from text"""
        doc = self.nlp(text)
        
        # Extract topics and subtopics
        topics = self.extract_topics(doc)
        
        # Build hierarchical structure
        mindmap = {
            'root': 'Course Syllabus',
            'topics': topics,
            'structure': self.build_hierarchy(topics)
        }
        
        return mindmap
    
    def extract_topics(self, doc):
        """Extract main topics from document"""
        topics = []
        current_topic = None
        
        for sent in doc.sents:
            # Look for topic indicators
            text = sent.text.strip()
            
            # Check if it's a heading (short sentence, starts with capital)
            if len(text.split()) <= 10 and text[0].isupper():
                # Extract key phrases
                key_phrases = self.extract_key_phrases(sent)
                if key_phrases:
                    topic = {
                        'title': text,
                        'keywords': key_phrases,
                        'subtopics': []
                    }
                    topics.append(topic)
                    current_topic = topic
            elif current_topic and len(text.split()) > 3:
                # Add as subtopic
                subtopic = {
                    'text': text[:100],  # Limit length
                    'keywords': self.extract_key_phrases(sent)
                }
                current_topic['subtopics'].append(subtopic)
        
        return topics
    
    def extract_key_phrases(self, sent):
        """Extract key phrases from sentence"""
        key_phrases = []
        
        # Extract noun phrases
        for chunk in sent.noun_chunks:
            if len(chunk.text.split()) <= 4:  # Limit phrase length
                key_phrases.append(chunk.text)
        
        # Extract named entities
        for ent in sent.ents:
            key_phrases.append(ent.text)
        
        return list(set(key_phrases))[:5]  # Limit to 5 key phrases
    
    def build_hierarchy(self, topics):
        """Build hierarchical structure for visualization"""
        hierarchy = {
            'name': 'Course Syllabus',
            'children': []
        }
        
        for topic in topics:
            topic_node = {
                'name': topic['title'],
                'keywords': topic['keywords'],
                'children': []
            }
            
            for subtopic in topic['subtopics']:
                subtopic_node = {
                    'name': subtopic['text'][:50],
                    'keywords': subtopic['keywords']
                }
                topic_node['children'].append(subtopic_node)
            
            hierarchy['children'].append(topic_node)
        
        return hierarchy
    
    def link_resources(self, topics):
        """Link study resources to topics"""
        resources = []
        
        for topic in topics:
            # Generate resource suggestions based on keywords
            topic_resources = {
                'topic': topic['title'],
                'resources': []
            }
            
            # Add generic resource types
            for keyword in topic['keywords'][:3]:
                topic_resources['resources'].append({
                    'type': 'video',
                    'title': f"Learn {keyword}",
                    'url': f"https://www.youtube.com/results?search_query={keyword.replace(' ', '+')}"
                })
                
                topic_resources['resources'].append({
                    'type': 'article',
                    'title': f"{keyword} - Wikipedia",
                    'url': f"https://en.wikipedia.org/wiki/{keyword.replace(' ', '_')}"
                })
            
            resources.append(topic_resources)
        
        return resources
    
    def analyze_syllabus(self, text):
        """Analyze syllabus complexity and structure"""
        doc = self.nlp(text)
        
        analysis = {
            'word_count': len([token for token in doc if not token.is_punct]),
            'sentence_count': len(list(doc.sents)),
            'topics_count': len(self.extract_topics(doc)),
            'complexity': self.calculate_complexity(doc),
            'key_concepts': self.extract_key_concepts(doc)
        }
        
        return analysis
    
    def calculate_complexity(self, doc):
        """Calculate text complexity"""
        # Simple complexity score based on sentence length
        sentences = list(doc.sents)
        if not sentences:
            return 'low'
        
        avg_length = sum(len(sent) for sent in sentences) / len(sentences)
        
        if avg_length < 15:
            return 'low'
        elif avg_length < 25:
            return 'medium'
        else:
            return 'high'
    
    def extract_key_concepts(self, doc):
        """Extract key concepts from document"""
        concepts = defaultdict(int)
        
        # Count noun phrases
        for chunk in doc.noun_chunks:
            if len(chunk.text.split()) <= 3:
                concepts[chunk.text.lower()] += 1
        
        # Sort by frequency and return top 10
        sorted_concepts = sorted(concepts.items(), key=lambda x: x[1], reverse=True)
        return [concept for concept, count in sorted_concepts[:10]]
