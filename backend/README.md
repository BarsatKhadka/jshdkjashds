# Organizational Memory Rebuilder API

FastAPI backend for extracting and transferring employee knowledge when they leave the organization.

## Features

- **Employee Knowledge Analysis**: Analyze all knowledge sources (documents, chats, emails) for an employee
- **Knowledge Capsule Generation**: Create comprehensive knowledge capsules from employee data
- **Tutorial & SOP Generation**: Automatically generate tutorials and Standard Operating Procedures
- **Knowledge Transfer**: Transfer knowledge from departing employee to new employee

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
python main.py
```

Or with uvicorn directly:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Employees
- `GET /api/employees` - List all employees
- `GET /api/employees/{id}` - Get employee details
- `POST /api/employees/{id}/analyze` - Analyze employee knowledge
- `GET /api/employees/{id}/knowledge-capsule` - Get knowledge capsule
- `POST /api/employees/{id}/generate-tutorials` - Generate tutorials and SOPs

### Data Sources
- `GET /api/documents?employee_id={id}` - Get documents
- `GET /api/chats?employee_id={id}` - Get chat messages
- `GET /api/emails?employee_id={id}` - Get emails

### Knowledge Transfer
- `POST /api/transfer/{from_id}/to/{to_id}` - Transfer knowledge between employees

### Generated Content
- `GET /api/tutorials?employee_id={id}` - Get tutorials
- `GET /api/sops?employee_id={id}` - Get Standard Operating Procedures

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Mock Data

The API includes realistic mock data for:
- 6 employees with different roles
- 15+ documents (technical docs, design docs, meeting notes, incident reports)
- 150+ chat messages across multiple channels
- 30+ emails with various importance levels
- Knowledge capsules with 5+ knowledge areas per employee
- Tutorials and SOPs for common procedures

## Example Usage

```python
# Analyze employee knowledge
POST /api/employees/emp_001/analyze

# Get knowledge capsule
GET /api/employees/emp_001/knowledge-capsule

# Transfer knowledge
POST /api/transfer/emp_001/to/emp_002
```

