import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# CORS configuration
cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
CORS(app, resources={r"/api/*": {"origins": cors_origins}})

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
    # Implementation will be added in later tasks
    return jsonify({
        'success': True,
        'message': 'Syllabus parsing endpoint - to be implemented'
    })

@app.route('/api/ai/generate-mindmap', methods=['POST'])
def generate_mindmap():
    """Generate mind map from extracted topics"""
    # Implementation will be added in later tasks
    return jsonify({
        'success': True,
        'message': 'Mind map generation endpoint - to be implemented'
    })

@app.route('/api/ai/find-references', methods=['POST'])
def find_references():
    """Find reference links for topics"""
    # Implementation will be added in later tasks
    return jsonify({
        'success': True,
        'message': 'Reference finder endpoint - to be implemented'
    })

@app.route('/api/ai/recommendations', methods=['POST'])
def generate_recommendations():
    """Generate study recommendations"""
    # Implementation will be added in later tasks
    return jsonify({
        'success': True,
        'message': 'Recommendations endpoint - to be implemented'
    })

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
