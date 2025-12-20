# How to Start the AI Service

## The AI service is NOT currently running!

The error "AI Service is not running. Please start the AI service on port 5000" means the Python Flask service needs to be started.

## Quick Start

### Option 1: Using Python directly

```bash
# Navigate to ai-service directory
cd ai-service

# Install dependencies (first time only)
pip install -r requirements.txt

# Start the service
python app.py
```

### Option 2: Using Python venv (Recommended)

```bash
# Navigate to ai-service directory
cd ai-service

# Create virtual environment (first time only)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Start the service
python app.py
```

## Verify It's Running

Once started, you should see:
```
 * Running on http://0.0.0.0:5000
 * Running on http://127.0.0.1:5000
```

Test the health endpoint:
```bash
curl http://localhost:5000/health
```

Should return:
```json
{
  "status": "ok",
  "service": "AI/ML Service",
  "version": "1.0.0"
}
```

## Dependencies Required

The `requirements.txt` should contain:
```
Flask==2.3.0
flask-cors==4.0.0
PyPDF2==3.0.1
python-dotenv==1.0.0
```

## Common Issues

### 1. Port 5000 Already in Use
If port 5000 is already in use, you can change it:

**In `ai-service/.env`:**
```
PORT=5001
```

**In `frontend/src/environments/environment.ts`:**
```typescript
aiServiceUrl: 'http://localhost:5001'
```

### 2. Python Not Found
Make sure Python 3.7+ is installed:
```bash
python --version
```

### 3. pip Not Found
```bash
python -m pip --version
```

### 4. Module Not Found Errors
Reinstall dependencies:
```bash
pip install -r requirements.txt --force-reinstall
```

## Running in Background

### Windows (PowerShell):
```powershell
Start-Process python -ArgumentList "app.py" -WorkingDirectory "ai-service" -WindowStyle Hidden
```

### Mac/Linux:
```bash
cd ai-service
nohup python app.py > ai-service.log 2>&1 &
```

## Stopping the Service

### Find the process:
```bash
# Windows
netstat -ano | findstr :5000

# Mac/Linux
lsof -i :5000
```

### Kill the process:
```bash
# Windows (replace PID with actual process ID)
taskkill /PID <PID> /F

# Mac/Linux
kill <PID>
```

## Testing the Mind Map Feature

Once the AI service is running:

1. Login as a student
2. Go to "Mind Map Helper"
3. Upload a PDF syllabus
4. The service will:
   - Extract text from PDF
   - Identify topics and subtopics
   - Generate an interactive mind map
   - Provide study resources

## Current Status

✅ AI Service Code: Ready
✅ Endpoints: Configured
✅ CORS: Enabled
❌ Service: **NOT RUNNING**

**Action Required:** Start the AI service using one of the methods above!
