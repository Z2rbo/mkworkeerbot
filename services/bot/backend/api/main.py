"""
Portfolio API - FastAPI Backend
Handles works management, contact forms, and admin authentication
"""

import os
import uuid
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional, List
from pathlib import Path

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, EmailStr
import aiosqlite

# Configuration
DATABASE_PATH = os.getenv("DATABASE_PATH", "data/portfolio.db")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "portfolio_admin_2024")
SECRET_KEY = os.getenv("SECRET_KEY", secrets.token_hex(32))
TOKEN_EXPIRE_HOURS = 24

# Ensure directories exist
Path(UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
Path("data").mkdir(parents=True, exist_ok=True)

# FastAPI App
app = FastAPI(
    title="Portfolio API",
    description="API for portfolio website and Telegram bot",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Pydantic Models
class Work(BaseModel):
    id: Optional[int] = None
    title: str
    category: str
    description: str
    image: Optional[str] = None
    link: Optional[str] = None
    created_at: Optional[str] = None

class WorkResponse(BaseModel):
    id: int
    title: str
    category: str
    description: str
    image: str
    link: Optional[str]
    created_at: str

class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    service: str
    message: str

class AdminLogin(BaseModel):
    password: str

class TokenResponse(BaseModel):
    token: str
    expires_at: str

# Database functions
async def init_db():
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS works (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                category TEXT NOT NULL,
                description TEXT NOT NULL,
                image TEXT,
                link TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS contacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                service TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_read BOOLEAN DEFAULT FALSE
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS admin_tokens (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                token TEXT UNIQUE NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await db.commit()

async def get_db():
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        yield db

# Auth functions
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token() -> str:
    return secrets.token_urlsafe(32)

async def verify_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.replace("Bearer ", "")
    
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM admin_tokens WHERE token = ? AND expires_at > datetime('now')",
            (token,)
        )
        result = await cursor.fetchone()
        
        if not result:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        
        return True

# Startup event
@app.on_event("startup")
async def startup():
    await init_db()

# Health check
@app.get("/")
async def root():
    return {"status": "ok", "message": "Portfolio API is running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

# Works endpoints
@app.get("/api/works", response_model=List[WorkResponse])
async def get_works():
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM works ORDER BY created_at DESC"
        )
        rows = await cursor.fetchall()
        
        works = []
        for row in rows:
            works.append({
                "id": row["id"],
                "title": row["title"],
                "category": row["category"],
                "description": row["description"],
                "image": row["image"] or "",
                "link": row["link"],
                "created_at": row["created_at"]
            })
        
        return works

@app.get("/api/works/{work_id}", response_model=WorkResponse)
async def get_work(work_id: int):
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM works WHERE id = ?", (work_id,)
        )
        row = await cursor.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Work not found")
        
        return {
            "id": row["id"],
            "title": row["title"],
            "category": row["category"],
            "description": row["description"],
            "image": row["image"] or "",
            "link": row["link"],
            "created_at": row["created_at"]
        }

@app.post("/api/works", response_model=WorkResponse)
async def create_work(
    title: str = Form(...),
    category: str = Form(...),
    description: str = Form(...),
    link: str = Form(None),
    image: UploadFile = File(None),
    authorized: bool = Depends(verify_token)
):
    image_path = None
    
    if image:
        # Generate unique filename
        ext = image.filename.split(".")[-1] if "." in image.filename else "jpg"
        filename = f"{uuid.uuid4()}.{ext}"
        filepath = Path(UPLOAD_DIR) / filename
        
        # Save file
        content = await image.read()
        with open(filepath, "wb") as f:
            f.write(content)
        
        image_path = f"/uploads/{filename}"
    
    async with aiosqlite.connect(DATABASE_PATH) as db:
        cursor = await db.execute(
            """
            INSERT INTO works (title, category, description, image, link)
            VALUES (?, ?, ?, ?, ?)
            """,
            (title, category, description, image_path, link)
        )
        await db.commit()
        work_id = cursor.lastrowid
        
        cursor = await db.execute("SELECT * FROM works WHERE id = ?", (work_id,))
        db.row_factory = aiosqlite.Row
        row = await cursor.fetchone()
        
        return {
            "id": work_id,
            "title": title,
            "category": category,
            "description": description,
            "image": image_path or "",
            "link": link,
            "created_at": datetime.now().isoformat()
        }

@app.put("/api/works/{work_id}", response_model=WorkResponse)
async def update_work(
    work_id: int,
    title: str = Form(...),
    category: str = Form(...),
    description: str = Form(...),
    link: str = Form(None),
    image: UploadFile = File(None),
    authorized: bool = Depends(verify_token)
):
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        
        # Check if work exists
        cursor = await db.execute("SELECT * FROM works WHERE id = ?", (work_id,))
        existing = await cursor.fetchone()
        
        if not existing:
            raise HTTPException(status_code=404, detail="Work not found")
        
        image_path = existing["image"]
        
        if image:
            # Delete old image if exists
            if existing["image"]:
                old_path = Path(UPLOAD_DIR) / existing["image"].replace("/uploads/", "")
                if old_path.exists():
                    old_path.unlink()
            
            # Save new image
            ext = image.filename.split(".")[-1] if "." in image.filename else "jpg"
            filename = f"{uuid.uuid4()}.{ext}"
            filepath = Path(UPLOAD_DIR) / filename
            
            content = await image.read()
            with open(filepath, "wb") as f:
                f.write(content)
            
            image_path = f"/uploads/{filename}"
        
        await db.execute(
            """
            UPDATE works SET title = ?, category = ?, description = ?, image = ?, link = ?
            WHERE id = ?
            """,
            (title, category, description, image_path, link, work_id)
        )
        await db.commit()
        
        return {
            "id": work_id,
            "title": title,
            "category": category,
            "description": description,
            "image": image_path or "",
            "link": link,
            "created_at": existing["created_at"]
        }

@app.delete("/api/works/{work_id}")
async def delete_work(work_id: int, authorized: bool = Depends(verify_token)):
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        
        # Get work to delete image
        cursor = await db.execute("SELECT image FROM works WHERE id = ?", (work_id,))
        row = await cursor.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Work not found")
        
        # Delete image file if exists
        if row["image"]:
            image_path = Path(UPLOAD_DIR) / row["image"].replace("/uploads/", "")
            if image_path.exists():
                image_path.unlink()
        
        await db.execute("DELETE FROM works WHERE id = ?", (work_id,))
        await db.commit()
        
        return {"message": "Work deleted successfully"}

# Contact endpoints
@app.post("/api/contact")
async def send_contact(contact: ContactMessage):
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute(
            """
            INSERT INTO contacts (name, email, service, message)
            VALUES (?, ?, ?, ?)
            """,
            (contact.name, contact.email, contact.service, contact.message)
        )
        await db.commit()
        
        return {"message": "Message sent successfully"}

@app.get("/api/contacts")
async def get_contacts(authorized: bool = Depends(verify_token)):
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM contacts ORDER BY created_at DESC"
        )
        rows = await cursor.fetchall()
        
        return [dict(row) for row in rows]

@app.put("/api/contacts/{contact_id}/read")
async def mark_contact_read(contact_id: int, authorized: bool = Depends(verify_token)):
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute(
            "UPDATE contacts SET is_read = TRUE WHERE id = ?",
            (contact_id,)
        )
        await db.commit()
        
        return {"message": "Contact marked as read"}

# Admin endpoints
@app.post("/api/admin/login", response_model=TokenResponse)
async def admin_login(login: AdminLogin):
    if login.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid password")
    
    token = generate_token()
    expires_at = datetime.now() + timedelta(hours=TOKEN_EXPIRE_HOURS)
    
    async with aiosqlite.connect(DATABASE_PATH) as db:
        # Clean expired tokens
        await db.execute("DELETE FROM admin_tokens WHERE expires_at < datetime('now')")
        
        # Create new token
        await db.execute(
            "INSERT INTO admin_tokens (token, expires_at) VALUES (?, ?)",
            (token, expires_at.isoformat())
        )
        await db.commit()
    
    return {
        "token": token,
        "expires_at": expires_at.isoformat()
    }

@app.get("/api/admin/verify")
async def verify_admin(authorized: bool = Depends(verify_token)):
    return {"valid": True}

@app.post("/api/admin/logout")
async def admin_logout(authorization: str = Header(None)):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
        
        async with aiosqlite.connect(DATABASE_PATH) as db:
            await db.execute("DELETE FROM admin_tokens WHERE token = ?", (token,))
            await db.commit()
    
    return {"message": "Logged out successfully"}

# Stats endpoint
@app.get("/api/stats")
async def get_stats():
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        
        works_cursor = await db.execute("SELECT COUNT(*) as count FROM works")
        works_count = (await works_cursor.fetchone())["count"]
        
        contacts_cursor = await db.execute("SELECT COUNT(*) as count FROM contacts")
        contacts_count = (await contacts_cursor.fetchone())["count"]
        
        unread_cursor = await db.execute(
            "SELECT COUNT(*) as count FROM contacts WHERE is_read = FALSE"
        )
        unread_count = (await unread_cursor.fetchone())["count"]
        
        return {
            "works_count": works_count,
            "contacts_count": contacts_count,
            "unread_contacts": unread_count
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
