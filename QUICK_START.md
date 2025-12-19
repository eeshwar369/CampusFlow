# 🚀 Quick Start Guide

## Prerequisites Check

Before starting, verify you have these installed:

```bash
# Check Node.js (should be v18+)
node --version

# Check npm
npm --version

# Check Python (should be v3.10+)
python --version

# Check MySQL (should be v8.0+)
mysql --version
```

If any are missing, install them first!

## 🎯 Automated Setup (Recommended)

### Step 1: Run Setup Script

```bash
# This will install all dependencies
setup-all.bat
```

This script will:
- ✅ Install backend dependencies (Node.js packages)
- ✅ Install frontend dependencies (Angular packages)
- ✅ Create Python virtual environment
- ✅ Install Python dependencies
- ✅ Download spaCy language model

### Step 2: Setup MySQL Database

**Option A: Using MySQL Workbench**
1. Open MySQL Workbench
2. Connect to your MySQL server
3. Open the file `database-setup.sql`
4. Click Execute (⚡ icon)

**Option B: Using Command Line**
```bash
mysql -u root -p < database-setup.sql
```

### Step 3: Configure Database Connection

Edit `backend/.env` file and update these lines:
```env
DB_USER=root
DB_PASSWORD=your_mysql_password_here
```

### Step 4: Run Database Migrations

```bash
cd backend
npm run migrate
npm run seed
cd ..
```

### Step 5: Start All Services

```bash
# This will start backend, frontend, and AI service
start-all.bat
```

### Step 6: Access the Application

Open your browser and go to: **http://localhost:4200**

## 🔐 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@university.edu | admin123 |
| **Student** | student@university.edu | student123 |
| **Seating Manager** | seating@university.edu | seating123 |
| **Club Coordinator** | club@university.edu | club123 |

## 📝 Manual Setup (Alternative)

If the automated scripts don't work, follow these steps:

### 1. Backend Setup
```bash
cd backend
npm install
# Edit .env file with your database credentials
npm run migrate
npm run seed
npm run dev
```

### 2. Frontend Setup (New Terminal)
```bash
cd frontend
npm install
npm start
```

### 3. AI Service Setup (New Terminal)
```bash
cd ai-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
python app.py
```

## ✅ Verify Everything is Running

You should see:

**Terminal 1 (Backend):**
```
Server running on port 3000
Environment: development
Database connected successfully
```

**Terminal 2 (Frontend):**
```
** Angular Live Development Server is listening on localhost:4200 **
✔ Compiled successfully.
```

**Terminal 3 (AI Service):**
```
* Running on http://0.0.0.0:5000
```

## 🔧 Common Issues & Solutions

### Issue: "Cannot connect to database"
**Solution:** 
- Ensure MySQL is running
- Check credentials in `backend/.env`
- Verify database exists: `SHOW DATABASES;` in MySQL

### Issue: "Port 3000 already in use"
**Solution:**
- Find and kill the process using port 3000
- Or change PORT in `backend/.env`

### Issue: "npm install fails"
**Solution:**
```bash
npm cache clean --force
npm install
```

### Issue: "Python module not found"
**Solution:**
```bash
cd ai-service
venv\Scripts\activate
pip install -r requirements.txt --force-reinstall
```

### Issue: "Angular compilation errors"
**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## 🧪 Running Tests

```bash
cd backend
npm test
```

## 🛑 Stopping the Application

Press `Ctrl+C` in each terminal window to stop the services.

## 📚 Next Steps

After successful login:
1. ✅ Test authentication with different user roles
2. ✅ Check browser console for any errors
3. ✅ Review backend logs for API calls
4. ✅ Explore the implemented features

## 🆘 Need Help?

If you're stuck:
1. Check all three terminal windows for error messages
2. Verify all prerequisites are installed correctly
3. Ensure MySQL is running and accessible
4. Check that all ports (3000, 4200, 5000) are available
5. Review the detailed SETUP_GUIDE.md

## 📊 System Architecture

```
┌─────────────────┐
│   Frontend      │  http://localhost:4200
│   (Angular)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Backend API   │  http://localhost:3000
│   (Node.js)     │
└────────┬────────┘
         │
         ├──────────────┐
         ▼              ▼
┌─────────────┐  ┌──────────────┐
│   MySQL     │  │  AI Service  │  http://localhost:5000
│  Database   │  │   (Python)   │
└─────────────┘  └──────────────┘
```

## 🎉 Success!

If you can see the login page and successfully log in, congratulations! The system is running correctly.
