# SmartTrace

SmartTrace is a full-stack pharmaceutical traceability and anti-counterfeit system built using Django REST Framework and React.

The platform enables secure product serialization, packaging hierarchy aggregation, scan verification, counterfeit detection, and product traceability across the pharmaceutical supply chain.

---

## Features

- JWT Authentication
- Role-based access control (Admin / Scanner)
- Batch serialization engine
- Product hierarchy aggregation
- Scan & verify workflow
- Location anomaly detection
- Scan history tracking with filtering
- Dashboard analytics
- Recalled & expired product detection
- Hierarchy tree visualization
- Bulk serial generation optimization
- Hierarchical bulk recall system
  
---

## Tech Stack

### Backend
- Django
- Django REST Framework
- JWT Authentication
- SQLite

### Frontend
- React
- Axios
- CSS

---

## Hierarchy

Primary Units → Secondary Cartons → Tertiary Pallets

Example:

```text
Pallet
 ├ Carton
 │   ├ Unit
 │   ├ Unit
 │   └ Unit
 └ Carton
     ├ Unit
     └ Unit

```

---

## Functionalities

### Authentication
- Secure JWT-based login system
- Admin and Scanner roles
- Protected APIs

### Serialization
- Unique serial number generation
- Luhn check digit validation
- SHA256 hash verification
- Bulk serial generation using optimized database operations

### Anti-Counterfeit Detection
- Duplicate scan detection
- Location anomaly detection
- Invalid/tampered serial detection
- Recalled and expired product detection

### Traceability
- Parent-child packaging hierarchy
- Product traceability across the supply chain
- Scan history monitoring
- Hierarchy tree visualization

### Product Lifecycle Management
- ACTIVE / EXPIRED / RECALLED status management
- Single product status updates
- Bulk hierarchy recall support
- Recursive child status propagation

### Dashboard
- Total products tracking
- Total serials analytics
- Scan analytics
- Suspect product monitoring

---

## Setup

### Backend

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# Linux / Mac
source venv/bin/activate

pip install -r requirements.txt

python manage.py migrate

python manage.py createsuperuser

python manage.py runserver

```

Backend runs at:

```text
http://127.0.0.1:8000/

```

---

### Frontend

```bash
cd frontend

npm install

npm start

```

Frontend runs at:

```text
http://localhost:3000/

```

---

## User Roles

### Admin
- Generate product batches
- View dashboard analytics
- Access hierarchy tools
- Update product status
- Trigger bulk recalls
- Monitor scan activity

### Scanner
- Scan and verify products
- View limited scan history

---
