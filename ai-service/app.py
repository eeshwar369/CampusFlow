import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# CORS configuration - Allow all routes for frontend access
cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:4200,http://localhost:3000').split(',')
CORS(app, resources={r"/*": {"origins": cors_origins}})

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'service': 'AI/ML Service',
        'version': '1.0.0'
    })

@app.route('/api/ai/parse-syllabus', methods=['POST'])
def parse_syllabus():
    """Parse syllabus document and extract topics"""
    try:
        from services.pdf_processor import PDFProcessor
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if not file or file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Save uploaded file
        upload_folder = 'uploads/syllabus'
        os.makedirs(upload_folder, exist_ok=True)
        file_path = os.path.join(upload_folder, file.filename)
        file.save(file_path)
        
        # Extract text from PDF
        pdf_processor = PDFProcessor()
        text = pdf_processor.extract_text(file_path)
        topics = pdf_processor.extract_topics(text)
        
        return jsonify({
            'success': True,
            'data': {
                'text': text[:500],  # First 500 chars
                'topics': topics
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate-mindmap', methods=['POST'])
def generate_mindmap_simple():
    """Generate mind map from uploaded PDF syllabus - Simple endpoint"""
    try:
        from services.pdf_processor import PDFProcessor
        from services.mindmap_service import MindMapService
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if not file or file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'Only PDF files are allowed'}), 400
        
        # Save uploaded file
        upload_folder = 'uploads/syllabus'
        os.makedirs(upload_folder, exist_ok=True)
        file_path = os.path.join(upload_folder, file.filename)
        file.save(file_path)
        
        try:
            # Extract text from PDF
            pdf_processor = PDFProcessor()
            text = pdf_processor.extract_text(file_path)
            
            if not text or len(text.strip()) < 50:
                return jsonify({'error': 'Could not extract sufficient text from PDF'}), 400
            
            # Generate mind map
            mindmap_service = MindMapService()
            mindmap_data = mindmap_service.generate_mindmap(text)
            
            # Link study resources
            resources = mindmap_service.link_resources(mindmap_data.get('topics', []))
            
            result = {
                'course_info': {
                    'title': file.filename.replace('.pdf', ''),
                    'description': 'Generated from uploaded syllabus'
                },
                'topics': mindmap_data.get('topics', []),
                'resources': resources,
                'key_concepts': mindmap_data.get('key_concepts', [])
            }
            
            # Clean up
            if os.path.exists(file_path):
                os.remove(file_path)
            
            return jsonify(result), 200
            
        except Exception as e:
            # Clean up on error
            if os.path.exists(file_path):
                os.remove(file_path)
            raise e
    
    except Exception as e:
        print(f"Error generating mindmap: {str(e)}")
        return jsonify({'error': f'Failed to generate mind map: {str(e)}'}), 500

@app.route('/api/ai/generate-mindmap', methods=['POST'])
def generate_mindmap():
    """Generate mind map from extracted topics"""
    try:
        from services.mindmap_service import MindMapService
        from services.pdf_processor import PDFProcessor
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        course_id = request.form.get('courseId')
        student_id = request.form.get('studentId')
        
        if not file or file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Save uploaded file
        upload_folder = 'uploads/syllabus'
        os.makedirs(upload_folder, exist_ok=True)
        file_path = os.path.join(upload_folder, file.filename)
        file.save(file_path)
        
        # Extract text from PDF
        pdf_processor = PDFProcessor()
        text = pdf_processor.extract_text(file_path)
        
        # Generate mind map
        mindmap_service = MindMapService()
        mindmap_data = mindmap_service.generate_mindmap(text)
        
        # Link study resources
        resources = mindmap_service.link_resources(mindmap_data['topics'])
        
        result = {
            'mindmap': mindmap_data,
            'resources': resources,
            'courseId': course_id,
            'studentId': student_id
        }
        
        return jsonify({'success': True, 'data': result})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/ai/find-references', methods=['POST'])
def find_references():
    """Find reference links for topics"""
    try:
        data = request.get_json()
        topics = data.get('topics', [])
        
        if not topics:
            return jsonify({'error': 'No topics provided'}), 400
        
        from services.mindmap_service import MindMapService
        mindmap_service = MindMapService()
        
        resources = []
        for topic in topics:
            topic_resources = {
                'topic': topic,
                'resources': [
                    {
                        'type': 'video',
                        'title': f"Learn {topic}",
                        'url': f"https://www.youtube.com/results?search_query={topic.replace(' ', '+')}"
                    },
                    {
                        'type': 'article',
                        'title': f"{topic} - Wikipedia",
                        'url': f"https://en.wikipedia.org/wiki/{topic.replace(' ', '_')}"
                    }
                ]
            }
            resources.append(topic_resources)
        
        return jsonify({'success': True, 'data': resources})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/ai/recommendations', methods=['POST'])
def generate_recommendations():
    """Generate study recommendations"""
    try:
        data = request.get_json()
        performance_data = data.get('performance', [])
        
        if not performance_data:
            return jsonify({'error': 'No performance data provided'}), 400
        
        recommendations = []
        
        for perf in performance_data:
            score = perf.get('score', 0)
            topic = perf.get('topic', 'Unknown')
            
            if score < 50:
                priority = 'high'
                message = f"Focus on {topic} - needs significant improvement"
            elif score < 75:
                priority = 'medium'
                message = f"Review {topic} - moderate improvement needed"
            else:
                priority = 'low'
                message = f"Maintain {topic} - good performance"
            
            recommendations.append({
                'topic': topic,
                'priority': priority,
                'message': message,
                'resources': [
                    f"https://www.youtube.com/results?search_query={topic.replace(' ', '+')}",
                    f"https://en.wikipedia.org/wiki/{topic.replace(' ', '_')}"
                ]
            })
        
        return jsonify({'success': True, 'data': recommendations})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.errorhandler(Exception)
def handle_error(error):
    return jsonify({
        'success': False,
        'error': {
            'code': 'INTERNAL_ERROR',
            'message': str(error)
        }
    }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.getenv('FLASK_ENV') == 'development')
