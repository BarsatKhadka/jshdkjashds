from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import datetime, timedelta
import random
from models import (
    Employee, EmployeeDetail, KnowledgeCapsule, Document, 
    ChatMessage, Email, Tutorial, SOP, TransferRequest, TransferResponse,
    AnalysisRequest, AnalysisResponse
)
from mock_data import (
    get_mock_employees, get_mock_employee_detail, 
    generate_knowledge_capsule, get_mock_documents,
    get_mock_chats, get_mock_emails, generate_tutorials,
    generate_sops
)

app = FastAPI(
    title="Organizational Memory Rebuilder API",
    description="AI-powered knowledge extraction and transfer system",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage (replace with database in production)
employees_db = get_mock_employees()
documents_db = get_mock_documents()
chats_db = get_mock_chats()
emails_db = get_mock_emails()

@app.get("/")
async def root():
    return {
        "message": "Organizational Memory Rebuilder API",
        "version": "1.0.0",
        "endpoints": {
            "employees": "/api/employees",
            "employee_detail": "/api/employees/{id}",
            "analyze": "/api/employees/{id}/analyze",
            "knowledge_capsule": "/api/employees/{id}/knowledge-capsule",
            "documents": "/api/documents",
            "chats": "/api/chats",
            "emails": "/api/emails",
            "tutorials": "/api/tutorials",
            "sops": "/api/sops",
            "transfer": "/api/transfer/{from_id}/to/{to_id}"
        }
    }

@app.get("/api/employees", response_model=List[Employee])
async def get_employees():
    """Get all employees"""
    return employees_db

@app.get("/api/employees/{employee_id}", response_model=EmployeeDetail)
async def get_employee_detail(employee_id: str):
    """Get detailed information about a specific employee"""
    employee = get_mock_employee_detail(employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee

@app.post("/api/employees/{employee_id}/analyze", response_model=AnalysisResponse)
async def analyze_employee_knowledge(employee_id: str, request: Optional[AnalysisRequest] = None):
    """Analyze employee's knowledge from all sources"""
    employee = next((e for e in employees_db if e.id == employee_id), None)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Simulate analysis process
    employee_docs = [d for d in documents_db if d.author_id == employee_id]
    employee_chats = [c for c in chats_db if c.participant_id == employee_id]
    employee_emails = [e for e in emails_db if e.sender_id == employee_id or employee_id in e.recipient_ids]
    
    analysis = AnalysisResponse(
        employee_id=employee_id,
        employee_name=employee.name,
        analysis_date=datetime.now().isoformat(),
        documents_analyzed=len(employee_docs),
        chats_analyzed=len(employee_chats),
        emails_analyzed=len(employee_emails),
        knowledge_areas=random.randint(5, 15),
        total_interactions=len(employee_docs) + len(employee_chats) + len(employee_emails),
        status="completed",
        insights=[
            f"Expert in {random.choice(['API design', 'Database optimization', 'System architecture', 'Security protocols', 'DevOps practices'])}",
            f"Handled {random.randint(10, 50)} critical incidents",
            f"Created {random.randint(5, 20)} technical documents",
            f"Collaborated with {random.randint(8, 25)} team members"
        ]
    )
    
    return analysis

@app.get("/api/employees/{employee_id}/knowledge-capsule", response_model=KnowledgeCapsule)
async def get_knowledge_capsule(employee_id: str):
    """Get the knowledge capsule for an employee"""
    employee = next((e for e in employees_db if e.id == employee_id), None)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    capsule = generate_knowledge_capsule(employee_id, employee.name, employee.role)
    return capsule

@app.get("/api/documents", response_model=List[Document])
async def get_documents(employee_id: Optional[str] = None, limit: int = 50):
    """Get documents, optionally filtered by employee"""
    docs = documents_db
    if employee_id:
        docs = [d for d in docs if d.author_id == employee_id]
    return docs[:limit]

@app.get("/api/chats", response_model=List[ChatMessage])
async def get_chats(employee_id: Optional[str] = None, limit: int = 100):
    """Get chat messages, optionally filtered by employee"""
    chats = chats_db
    if employee_id:
        chats = [c for c in chats if c.participant_id == employee_id]
    return chats[:limit]

@app.get("/api/emails", response_model=List[Email])
async def get_emails(employee_id: Optional[str] = None, limit: int = 50):
    """Get emails, optionally filtered by employee"""
    emails = emails_db
    if employee_id:
        emails = [e for e in emails if employee_id in e.recipient_ids or e.sender_id == employee_id]
    return emails[:limit]

@app.get("/api/tutorials", response_model=List[Tutorial])
async def get_tutorials(employee_id: Optional[str] = None):
    """Get tutorials generated from employee knowledge"""
    tutorials = generate_tutorials(employee_id)
    return tutorials

@app.get("/api/sops", response_model=List[SOP])
async def get_sops(employee_id: Optional[str] = None):
    """Get Standard Operating Procedures generated from employee knowledge"""
    sops = generate_sops(employee_id)
    return sops

@app.post("/api/employees/{employee_id}/generate-tutorials")
async def generate_employee_tutorials(employee_id: str):
    """Generate tutorials and SOPs for an employee"""
    employee = next((e for e in employees_db if e.id == employee_id), None)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    tutorials = generate_tutorials(employee_id)
    sops = generate_sops(employee_id)
    
    return {
        "employee_id": employee_id,
        "employee_name": employee.name,
        "tutorials_generated": len(tutorials),
        "sops_generated": len(sops),
        "tutorials": tutorials,
        "sops": sops,
        "generated_at": datetime.now().isoformat()
    }

@app.post("/api/transfer/{from_id}/to/{to_id}", response_model=TransferResponse)
async def transfer_knowledge(from_id: str, to_id: str, request: Optional[TransferRequest] = None):
    """Transfer knowledge from one employee to another"""
    from_employee = next((e for e in employees_db if e.id == from_id), None)
    to_employee = next((e for e in employees_db if e.id == to_id), None)
    
    if not from_employee:
        raise HTTPException(status_code=404, detail=f"Source employee {from_id} not found")
    if not to_employee:
        raise HTTPException(status_code=404, detail=f"Target employee {to_id} not found")
    
    # Generate knowledge capsule
    capsule = generate_knowledge_capsule(from_id, from_employee.name, from_employee.role)
    tutorials = generate_tutorials(from_id)
    sops = generate_sops(from_id)
    
    response = TransferResponse(
        from_employee_id=from_id,
        from_employee_name=from_employee.name,
        to_employee_id=to_id,
        to_employee_name=to_employee.name,
        transfer_date=datetime.now().isoformat(),
        knowledge_capsule=capsule,
        tutorials_transferred=len(tutorials),
        sops_transferred=len(sops),
        estimated_handover_time_weeks=random.uniform(2.0, 4.0),
        status="completed",
        summary=f"Successfully transferred knowledge from {from_employee.name} to {to_employee.name}. "
                f"Included {len(capsule.knowledge_areas)} knowledge areas, {len(tutorials)} tutorials, "
                f"and {len(sops)} SOPs. Estimated handover time saved: {random.randint(2, 4)} weeks."
    )
    
    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

