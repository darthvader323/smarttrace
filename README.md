# SmartTrace

SmartTrace is a full-stack pharmaceutical traceability and anti-counterfeit system built using Django REST Framework and React.

## Features

- JWT Authentication
- Role-based access (Admin / Scanner)
- Batch serialization engine
- Product hierarchy aggregation
- Scan & verify workflow
- Location anomaly detection
- Scan history tracking
- Dashboard analytics

## Tech Stack

### Backend
- Django
- Django REST Framework
- SQLite

### Frontend
- React
- Axios

## Hierarchy

Primary Units → Secondary Cartons → Tertiary Pallets

## Setup

### Backend

```bash
cd backend
python -m venv venv
pip install -r requirements.txt
python manage.py runserver
```
### Frontend
```bash
cd frontend
npm install
npm start
```
