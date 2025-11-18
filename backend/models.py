from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class EmployeeRole(str, Enum):
    SOFTWARE_ENGINEER = "Software Engineer"
    SENIOR_ENGINEER = "Senior Software Engineer"
    TECH_LEAD = "Tech Lead"
    PRODUCT_MANAGER = "Product Manager"
    DEVOPS_ENGINEER = "DevOps Engineer"
    DATA_SCIENTIST = "Data Scientist"
    QA_ENGINEER = "QA Engineer"
    ARCHITECT = "Solution Architect"

class Employee(BaseModel):
    id: str
    name: str
    email: str
    role: str
    department: str
    start_date: str
    status: str = "active"

class EmployeeDetail(Employee):
    bio: Optional[str] = None
    skills: List[str] = []
    projects: List[str] = []
    direct_reports: List[str] = []
    manager_id: Optional[str] = None

class KnowledgeArea(BaseModel):
    topic: str
    expertise_level: str  # beginner, intermediate, advanced, expert
    sources: List[str] = []  # document IDs, chat IDs, email IDs
    key_insights: List[str] = []
    related_people: List[str] = []

class KnowledgeCapsule(BaseModel):
    employee_id: str
    employee_name: str
    role: str
    created_at: str
    knowledge_areas: List[KnowledgeArea]
    total_documents: int
    total_chats: int
    total_emails: int
    key_relationships: List[str] = []
    critical_knowledge: List[str] = []
    handover_priority: str = "high"  # low, medium, high, critical

class Document(BaseModel):
    id: str
    title: str
    content: str
    author_id: str
    author_name: str
    document_type: str  # technical_doc, design_doc, meeting_notes, etc.
    created_at: str
    updated_at: str
    tags: List[str] = []
    project: Optional[str] = None

class ChatMessage(BaseModel):
    id: str
    participant_id: str
    participant_name: str
    channel: str  # slack, teams, discord, etc.
    content: str
    timestamp: str
    thread_id: Optional[str] = None
    mentions: List[str] = []

class Email(BaseModel):
    id: str
    subject: str
    body: str
    sender_id: str
    sender_name: str
    recipient_ids: List[str]
    recipient_names: List[str]
    sent_at: str
    attachments: List[str] = []
    importance: str = "normal"  # low, normal, high, urgent

class Tutorial(BaseModel):
    id: str
    title: str
    description: str
    content: str
    employee_id: str
    employee_name: str
    knowledge_area: str
    difficulty_level: str  # beginner, intermediate, advanced
    estimated_time_minutes: int
    steps: List[str] = []
    resources: List[str] = []
    created_at: str

class SOP(BaseModel):
    id: str
    title: str
    description: str
    procedure: str
    employee_id: str
    employee_name: str
    category: str  # deployment, troubleshooting, onboarding, etc.
    steps: List[str] = []
    prerequisites: List[str] = []
    related_systems: List[str] = []
    created_at: str

class AnalysisRequest(BaseModel):
    include_documents: bool = True
    include_chats: bool = True
    include_emails: bool = True
    date_range_start: Optional[str] = None
    date_range_end: Optional[str] = None

class AnalysisResponse(BaseModel):
    employee_id: str
    employee_name: str
    analysis_date: str
    documents_analyzed: int
    chats_analyzed: int
    emails_analyzed: int
    knowledge_areas: int
    total_interactions: int
    status: str
    insights: List[str] = []

class TransferRequest(BaseModel):
    include_tutorials: bool = True
    include_sops: bool = True
    priority_areas: Optional[List[str]] = None

class TransferResponse(BaseModel):
    from_employee_id: str
    from_employee_name: str
    to_employee_id: str
    to_employee_name: str
    transfer_date: str
    knowledge_capsule: KnowledgeCapsule
    tutorials_transferred: int
    sops_transferred: int
    estimated_handover_time_weeks: float
    status: str
    summary: str

# New models for offboarding view
class DataSourcesSummary(BaseModel):
    documents: int
    chat_messages: int
    emails: int
    total: int

class KnowledgeNode(BaseModel):
    id: str
    topic: str
    x: float
    y: float
    connections: List[str] = []
    snippet: str = ""

class KnowledgeMapping(BaseModel):
    nodes: List[KnowledgeNode]
    connections: List[dict] = []

class TimelineDataPoint(BaseModel):
    week: str
    commits: int
    incidents: int
    docs_authored: int

class WorkPatternTimeline(BaseModel):
    data_points: List[TimelineDataPoint]

class ExtractionLog(BaseModel):
    id: str
    message: str
    timestamp: str
    status: str  # completed, processing

class OffboardingView(BaseModel):
    employee_id: str
    employee_name: str
    role: str
    days_until_exit: int
    data_sources: DataSourcesSummary
    knowledge_mapping: KnowledgeMapping
    work_timeline: WorkPatternTimeline
    extraction_log: List[ExtractionLog]

# New models for capsule builder view
class Skill(BaseModel):
    name: str
    confidence: int  # 0-100
    sources_count: int

class SkillsMatrix(BaseModel):
    skills: List[Skill]

class Responsibility(BaseModel):
    id: str
    title: str
    frequency: str
    criticality: str

class SOPDetail(BaseModel):
    id: str
    title: str
    steps: List[str]
    estimated_time: int
    category: str

class RiskGap(BaseModel):
    id: str
    type: str  # undocumented_workflow, tribal_knowledge
    description: str
    severity: str  # low, medium, high

class CapsuleBuilderView(BaseModel):
    employee_id: str
    employee_name: str
    role: str
    skills_matrix: SkillsMatrix
    responsibilities: List[Responsibility]
    sops: List[SOPDetail]
    tutorials: List[Tutorial]
    risk_gaps: List[RiskGap]
    total_previous_employees: int

# New models for new employee view
class OnboardingStep(BaseModel):
    id: str
    title: str
    status: str  # completed, in-progress, locked
    order: int

class SkillGap(BaseModel):
    skill: str
    current_level: int  # 0-100
    target_level: int  # 0-100

class SkillsGapAnalysis(BaseModel):
    gaps: List[SkillGap]

class LearningModule(BaseModel):
    id: str
    title: str
    description: str
    lessons: List[str]
    unlocked: bool
    order: int

class ScenarioOption(BaseModel):
    id: str
    text: str
    correct: bool
    explanation: str

class Scenario(BaseModel):
    id: str
    title: str
    description: str
    options: List[ScenarioOption]
    match_percentage: Optional[int] = None

class NewEmployeeView(BaseModel):
    employee_id: str
    employee_name: str
    role: str
    onboarding_path: List[OnboardingStep]
    skills_gaps: SkillsGapAnalysis
    learning_modules: List[LearningModule]
    scenarios: List[Scenario]
