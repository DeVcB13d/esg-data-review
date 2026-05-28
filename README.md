# Breathe ESG - Data Review Prototype

## Project Overview
This repository contains a prototype application for ingesting, normalizing, and reviewing emissions data from multiple sources (SAP, Utility Bills, Corporate Travel) before audit.

## Directory Structure
- `/backend`: Django REST API
- `/frontend`: React Dashboard
- `MODEL.md`: Data model design and justification
- `DECISIONS.md`: Ambiguities resolved and implementation choices
- `TRADEOFFS.md`: Things deliberately not built and why
- `SOURCES.md`: Research on real-world data shapes and sample data explanations

## Setup Instructions

### Backend (Django)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`
4. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Apply database migrations:
   ```bash
   python manage.py migrate
   ```
6. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend (React/Vite)
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
