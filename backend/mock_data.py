from datetime import datetime, timedelta
import random
from typing import List, Optional
from models import (
    Employee, EmployeeDetail, KnowledgeCapsule, KnowledgeArea,
    Document, ChatMessage, Email, Tutorial, SOP
)

# Realistic employee data
EMPLOYEES_DATA = [
    {
        "id": "emp_001",
        "name": "Sarah Chen",
        "email": "sarah.chen@company.com",
        "role": "Senior Software Engineer",
        "department": "Engineering",
        "start_date": "2021-03-15",
        "bio": "Full-stack developer specializing in microservices architecture and cloud infrastructure. Led migration to Kubernetes.",
        "skills": ["Python", "Kubernetes", "Docker", "AWS", "PostgreSQL", "React", "Microservices"],
        "projects": ["Payment Gateway", "User Authentication System", "API Gateway Migration"],
        "direct_reports": [],
        "manager_id": "emp_005"
    },
    {
        "id": "emp_002",
        "name": "Michael Rodriguez",
        "email": "michael.r@company.com",
        "role": "Tech Lead",
        "department": "Engineering",
        "start_date": "2019-08-20",
        "bio": "Experienced tech lead with expertise in system design, database optimization, and team management.",
        "skills": ["System Design", "Database Optimization", "Team Leadership", "Java", "Spring Boot", "MongoDB"],
        "projects": ["E-commerce Platform", "Real-time Analytics", "Legacy System Modernization"],
        "direct_reports": ["emp_001", "emp_003"],
        "manager_id": "emp_006"
    },
    {
        "id": "emp_003",
        "name": "Emily Watson",
        "email": "emily.watson@company.com",
        "role": "DevOps Engineer",
        "department": "Engineering",
        "start_date": "2020-11-10",
        "bio": "DevOps specialist focused on CI/CD pipelines, infrastructure as code, and monitoring solutions.",
        "skills": ["Terraform", "Jenkins", "Prometheus", "Grafana", "Linux", "Bash", "Ansible"],
        "projects": ["CI/CD Pipeline Setup", "Infrastructure Automation", "Monitoring Dashboard"],
        "direct_reports": [],
        "manager_id": "emp_002"
    },
    {
        "id": "emp_004",
        "name": "David Kim",
        "email": "david.kim@company.com",
        "role": "Product Manager",
        "department": "Product",
        "start_date": "2022-01-05",
        "bio": "Product manager with technical background, focusing on API products and developer experience.",
        "skills": ["Product Strategy", "API Design", "Agile", "Data Analysis", "Stakeholder Management"],
        "projects": ["API Platform", "Developer Portal", "Product Analytics"],
        "direct_reports": [],
        "manager_id": "emp_006"
    },
    {
        "id": "emp_005",
        "name": "Jennifer Martinez",
        "email": "jennifer.m@company.com",
        "role": "Solution Architect",
        "department": "Engineering",
        "start_date": "2018-05-12",
        "bio": "Solution architect with 10+ years experience designing scalable distributed systems.",
        "skills": ["System Architecture", "Cloud Architecture", "Security", "Scalability", "AWS", "Azure"],
        "projects": ["Multi-cloud Strategy", "Security Framework", "Scalability Improvements"],
        "direct_reports": ["emp_001"],
        "manager_id": "emp_006"
    },
    {
        "id": "emp_006",
        "name": "Robert Thompson",
        "email": "robert.t@company.com",
        "role": "Engineering Manager",
        "department": "Engineering",
        "start_date": "2017-02-28",
        "bio": "Engineering manager overseeing multiple teams and strategic technical initiatives.",
        "skills": ["Team Management", "Strategic Planning", "Technical Leadership", "Budget Management"],
        "projects": ["Engineering Excellence", "Team Scaling", "Technical Roadmap"],
        "direct_reports": ["emp_002", "emp_004", "emp_005"],
        "manager_id": None
    }
]

# Realistic document templates
DOCUMENT_TEMPLATES = [
    {
        "title": "API Gateway Architecture Design",
        "type": "design_doc",
        "content": "This document outlines the architecture for our new API Gateway implementation. The gateway will handle authentication, rate limiting, request routing, and response transformation. Key components include: 1) Authentication service integration, 2) Rate limiting middleware, 3) Load balancer configuration, 4) Monitoring and logging setup.",
        "tags": ["architecture", "api", "gateway", "design"]
    },
    {
        "title": "Database Migration Strategy - PostgreSQL",
        "type": "technical_doc",
        "content": "Migration plan from MySQL to PostgreSQL. Steps include: 1) Schema mapping and conversion, 2) Data migration scripts, 3) Application code updates, 4) Testing strategy, 5) Rollback procedures. Estimated downtime: 4 hours during maintenance window.",
        "tags": ["database", "migration", "postgresql", "strategy"]
    },
    {
        "title": "Kubernetes Deployment Best Practices",
        "type": "technical_doc",
        "content": "Best practices for deploying applications on Kubernetes: resource limits, health checks, rolling updates, secrets management, config maps, and monitoring. Includes examples from production deployments.",
        "tags": ["kubernetes", "deployment", "devops", "best-practices"]
    },
    {
        "title": "Sprint Planning Notes - Q4 2024",
        "type": "meeting_notes",
        "content": "Sprint planning discussion: priorities include payment gateway improvements, user authentication enhancements, and API rate limiting. Team capacity: 8 story points. Risks identified: third-party API dependency delays.",
        "tags": ["sprint", "planning", "q4"]
    },
    {
        "title": "Incident Post-Mortem: Payment Processing Outage",
        "type": "incident_report",
        "content": "Root cause: Database connection pool exhaustion. Impact: 2-hour outage affecting 15% of transactions. Resolution: Increased pool size, added monitoring alerts. Prevention: Implemented circuit breaker pattern and improved monitoring.",
        "tags": ["incident", "post-mortem", "payment", "outage"]
    }
]

# Realistic chat message templates
CHAT_TEMPLATES = [
    "Hey team, I've updated the API documentation with the new authentication flow. Check it out when you get a chance.",
    "Quick question: has anyone encountered issues with the database connection pool? Seeing some timeouts in production.",
    "The deployment to staging is complete. All tests passed. Ready for review.",
    "Found a bug in the payment processing logic. Created a fix in branch feature/payment-fix. Can someone review?",
    "Just finished the architecture review. The new microservices design looks solid. Let's schedule a deep dive session.",
    "Reminder: we have a production deployment tonight at 10 PM. Please be available for monitoring.",
    "I've created a troubleshooting guide for the common issues we've been seeing. Link in the docs folder.",
    "The monitoring dashboard is now live. You can access it at monitoring.company.com. Let me know if you need access.",
    "Quick update: the database migration is scheduled for this weekend. I'll send out detailed instructions tomorrow.",
    "Can someone help me understand the authentication flow? I'm working on integrating a new service."
]

# Realistic email templates
EMAIL_TEMPLATES = [
    {
        "subject": "Production Deployment - API Gateway v2.0",
        "body": "Hi team, we're deploying the new API Gateway version to production tonight at 10 PM EST. This includes improved rate limiting and authentication. Please review the deployment checklist and be available for monitoring. Any issues, ping me immediately.",
        "importance": "high"
    },
    {
        "subject": "Database Migration - Action Required",
        "body": "The PostgreSQL migration is scheduled for this Saturday. Please ensure all your database queries are compatible. I've attached a compatibility guide. Questions? Let's schedule a sync.",
        "importance": "urgent"
    },
    {
        "subject": "Architecture Review - New Microservices Design",
        "body": "I've completed the architecture review for the new microservices design. Overall looks good, but I have a few recommendations around service boundaries and data consistency. See attached document.",
        "importance": "normal"
    },
    {
        "subject": "Incident Report - Payment Processing",
        "body": "Post-mortem for yesterday's payment processing outage is now available. Key learnings: need better monitoring for connection pools and implement circuit breakers. Action items assigned.",
        "importance": "high"
    }
]

def get_mock_employees() -> List[Employee]:
    """Get list of mock employees"""
    return [Employee(**emp) for emp in EMPLOYEES_DATA]

def get_mock_employee_detail(employee_id: str) -> Optional[EmployeeDetail]:
    """Get detailed employee information"""
    emp_data = next((e for e in EMPLOYEES_DATA if e["id"] == employee_id), None)
    if not emp_data:
        return None
    return EmployeeDetail(**emp_data)

def get_mock_documents() -> List[Document]:
    """Generate realistic mock documents"""
    documents = []
    authors = EMPLOYEES_DATA[:4]  # First 4 employees create documents
    
    for i, template in enumerate(DOCUMENT_TEMPLATES * 3):  # Repeat for more documents
        author = random.choice(authors)
        days_ago = random.randint(1, 180)
        created = datetime.now() - timedelta(days=days_ago)
        updated = created + timedelta(days=random.randint(0, 30))
        
        doc = Document(
            id=f"doc_{i+1:03d}",
            title=template["title"],
            content=template["content"],
            author_id=author["id"],
            author_name=author["name"],
            document_type=template["type"],
            created_at=created.isoformat(),
            updated_at=updated.isoformat(),
            tags=template["tags"],
            project=random.choice(["Payment Gateway", "API Platform", "User Auth", "Analytics", None])
        )
        documents.append(doc)
    
    return documents

def get_mock_chats() -> List[ChatMessage]:
    """Generate realistic mock chat messages"""
    chats = []
    employees = EMPLOYEES_DATA
    channels = ["engineering", "devops", "product", "general", "incidents"]
    
    for i in range(150):
        employee = random.choice(employees)
        days_ago = random.randint(1, 90)
        timestamp = datetime.now() - timedelta(days=days_ago, hours=random.randint(0, 23), minutes=random.randint(0, 59))
        
        chat = ChatMessage(
            id=f"chat_{i+1:03d}",
            participant_id=employee["id"],
            participant_name=employee["name"],
            channel=random.choice(channels),
            content=random.choice(CHAT_TEMPLATES),
            timestamp=timestamp.isoformat(),
            thread_id=f"thread_{random.randint(1, 20)}" if random.random() > 0.7 else None,
            mentions=[random.choice(employees)["id"] for _ in range(random.randint(0, 2))]
        )
        chats.append(chat)
    
    return chats

def get_mock_emails() -> List[Email]:
    """Generate realistic mock emails"""
    emails = []
    employees = EMPLOYEES_DATA
    
    for i, template in enumerate(EMAIL_TEMPLATES * 8):  # Repeat templates
        sender = random.choice(employees)
        recipients = random.sample([e for e in employees if e["id"] != sender["id"]], k=random.randint(1, 4))
        days_ago = random.randint(1, 120)
        sent_at = datetime.now() - timedelta(days=days_ago, hours=random.randint(0, 23))
        
        email = Email(
            id=f"email_{i+1:03d}",
            subject=template["subject"],
            body=template["body"],
            sender_id=sender["id"],
            sender_name=sender["name"],
            recipient_ids=[r["id"] for r in recipients],
            recipient_names=[r["name"] for r in recipients],
            sent_at=sent_at.isoformat(),
            attachments=[f"attachment_{j}.pdf" for j in range(random.randint(0, 2))],
            importance=template["importance"]
        )
        emails.append(email)
    
    return emails

def generate_knowledge_capsule(employee_id: str, employee_name: str, role: str) -> KnowledgeCapsule:
    """Generate a knowledge capsule for an employee"""
    knowledge_areas = [
        KnowledgeArea(
            topic="API Design and Architecture",
            expertise_level="expert",
            sources=["doc_001", "doc_005", "chat_023", "email_012"],
            key_insights=[
                "Designed RESTful API following OpenAPI 3.0 standards",
                "Implemented rate limiting and authentication middleware",
                "Expert in microservices communication patterns"
            ],
            related_people=["emp_002", "emp_004"]
        ),
        KnowledgeArea(
            topic="Database Optimization",
            expertise_level="advanced",
            sources=["doc_002", "chat_045", "email_008"],
            key_insights=[
                "Led PostgreSQL migration from MySQL",
                "Optimized query performance reducing latency by 40%",
                "Designed database sharding strategy"
            ],
            related_people=["emp_002", "emp_003"]
        ),
        KnowledgeArea(
            topic="Kubernetes and Container Orchestration",
            expertise_level="expert",
            sources=["doc_003", "chat_067", "email_015"],
            key_insights=[
                "Architected Kubernetes deployment strategy",
                "Implemented auto-scaling and health checks",
                "Created deployment pipelines using Helm charts"
            ],
            related_people=["emp_003", "emp_005"]
        ),
        KnowledgeArea(
            topic="Payment Gateway Integration",
            expertise_level="advanced",
            sources=["doc_004", "chat_089", "email_022"],
            key_insights=[
                "Integrated multiple payment providers (Stripe, PayPal)",
                "Handled PCI compliance requirements",
                "Implemented fraud detection mechanisms"
            ],
            related_people=["emp_001", "emp_004"]
        ),
        KnowledgeArea(
            topic="Incident Management and Troubleshooting",
            expertise_level="advanced",
            sources=["doc_005", "chat_112", "email_028"],
            key_insights=[
                "Led resolution of critical production outages",
                "Created runbooks for common incidents",
                "Established on-call rotation procedures"
            ],
            related_people=["emp_002", "emp_003", "emp_005"]
        )
    ]
    
    return KnowledgeCapsule(
        employee_id=employee_id,
        employee_name=employee_name,
        role=role,
        created_at=datetime.now().isoformat(),
        knowledge_areas=knowledge_areas,
        total_documents=random.randint(15, 45),
        total_chats=random.randint(80, 200),
        total_emails=random.randint(50, 150),
        key_relationships=["emp_002", "emp_003", "emp_004", "emp_005"],
        critical_knowledge=[
            "Payment gateway authentication flow",
            "Database connection pool configuration",
            "Kubernetes deployment procedures",
            "API rate limiting implementation"
        ],
        handover_priority="high"
    )

def generate_tutorials(employee_id: Optional[str] = None) -> List[Tutorial]:
    """Generate tutorials based on employee knowledge"""
    tutorials = [
        Tutorial(
            id="tut_001",
            title="Setting Up API Gateway Authentication",
            description="Step-by-step guide to configure authentication in the API Gateway",
            content="This tutorial covers the complete setup process for API Gateway authentication including JWT token validation, API key management, and OAuth integration.",
            employee_id=employee_id or "emp_001",
            employee_name="Sarah Chen",
            knowledge_area="API Design and Architecture",
            difficulty_level="intermediate",
            estimated_time_minutes=45,
            steps=[
                "1. Configure authentication service endpoint",
                "2. Set up JWT token validation middleware",
                "3. Configure API key management",
                "4. Test authentication flow",
                "5. Set up monitoring and alerts"
            ],
            resources=["API Gateway docs", "Authentication service repo", "Example configuration files"],
            created_at=datetime.now().isoformat()
        ),
        Tutorial(
            id="tut_002",
            title="PostgreSQL Migration Guide",
            description="Complete guide for migrating from MySQL to PostgreSQL",
            content="This tutorial walks through the entire migration process including schema conversion, data migration, and application updates.",
            employee_id=employee_id or "emp_001",
            employee_name="Sarah Chen",
            knowledge_area="Database Optimization",
            difficulty_level="advanced",
            estimated_time_minutes=120,
            steps=[
                "1. Analyze MySQL schema and create PostgreSQL equivalent",
                "2. Convert data types and constraints",
                "3. Run data migration scripts",
                "4. Update application code for PostgreSQL",
                "5. Test and validate migration",
                "6. Plan and execute cutover"
            ],
            resources=["Migration scripts", "Schema comparison tool", "Rollback procedures"],
            created_at=datetime.now().isoformat()
        ),
        Tutorial(
            id="tut_003",
            title="Kubernetes Deployment Best Practices",
            description="Learn how to deploy applications on Kubernetes following production best practices",
            content="Comprehensive guide covering resource management, health checks, rolling updates, and monitoring.",
            employee_id=employee_id or "emp_003",
            employee_name="Emily Watson",
            knowledge_area="Kubernetes and Container Orchestration",
            difficulty_level="intermediate",
            estimated_time_minutes=60,
            steps=[
                "1. Configure resource limits and requests",
                "2. Set up liveness and readiness probes",
                "3. Configure rolling update strategy",
                "4. Set up secrets and config maps",
                "5. Configure monitoring and logging"
            ],
            resources=["Kubernetes documentation", "Helm chart templates", "Monitoring setup guide"],
            created_at=datetime.now().isoformat()
        )
    ]
    
    return tutorials

def generate_sops(employee_id: Optional[str] = None) -> List[SOP]:
    """Generate Standard Operating Procedures"""
    sops = [
        SOP(
            id="sop_001",
            title="Payment Gateway Incident Response",
            description="Standard procedure for handling payment gateway incidents",
            procedure="When a payment gateway incident occurs: 1) Check monitoring dashboard for errors, 2) Verify payment provider status page, 3) Check database connection pool, 4) Review recent deployments, 5) Escalate if unresolved within 15 minutes",
            employee_id=employee_id or "emp_001",
            employee_name="Sarah Chen",
            category="incident_response",
            steps=[
                "Access monitoring dashboard",
                "Check payment provider status",
                "Verify database connections",
                "Review application logs",
                "Test payment endpoint",
                "Escalate if needed"
            ],
            prerequisites=["Access to monitoring dashboard", "Payment provider credentials", "Database access"],
            related_systems=["Payment Gateway", "Database", "Monitoring System"],
            created_at=datetime.now().isoformat()
        ),
        SOP(
            id="sop_002",
            title="Production Deployment Checklist",
            description="Step-by-step checklist for production deployments",
            procedure="Before deploying to production: 1) Run all tests, 2) Review code changes, 3) Check database migrations, 4) Verify configuration, 5) Notify team, 6) Monitor during deployment, 7) Verify post-deployment",
            employee_id=employee_id or "emp_003",
            employee_name="Emily Watson",
            category="deployment",
            steps=[
                "Run test suite",
                "Code review approval",
                "Check database migrations",
                "Verify environment configuration",
                "Notify team via Slack",
                "Execute deployment",
                "Monitor metrics",
                "Verify functionality",
                "Update deployment log"
            ],
            prerequisites=["CI/CD access", "Production credentials", "Monitoring access"],
            related_systems=["CI/CD Pipeline", "Production Environment", "Monitoring"],
            created_at=datetime.now().isoformat()
        ),
        SOP(
            id="sop_003",
            title="Database Connection Pool Troubleshooting",
            description="Procedure for diagnosing and fixing database connection pool issues",
            procedure="If experiencing connection pool exhaustion: 1) Check current pool usage, 2) Review connection timeout settings, 3) Check for connection leaks, 4) Review query performance, 5) Adjust pool size if needed",
            employee_id=employee_id or "emp_002",
            employee_name="Michael Rodriguez",
            category="troubleshooting",
            steps=[
                "Check pool metrics in monitoring",
                "Review connection timeout logs",
                "Identify connection leaks",
                "Analyze slow queries",
                "Adjust pool configuration",
                "Test and monitor"
            ],
            prerequisites=["Database access", "Monitoring dashboard", "Configuration access"],
            related_systems=["Database", "Application Server", "Monitoring"],
            created_at=datetime.now().isoformat()
        )
    ]
    
    return sops

