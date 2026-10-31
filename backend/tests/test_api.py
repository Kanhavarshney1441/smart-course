import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_temp.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
Base.metadata.create_all(bind=engine)
client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "statistics" in data

def test_auth_registration_and_login():
    test_email = "test_student@example.com"
    reg_response = client.post("/auth/register", json={
        "email": test_email,
        "password": "password123",
        "full_name": "Test Student",
        "role": "student"
    })
    assert reg_response.status_code in [201, 400]  # 201 created or 400 if already exists

    login_response = client.post("/auth/login", json={
        "email": test_email,
        "password": "password123"
    })
    assert login_response.status_code == 200
    data = login_response.json()
    assert "token" in data
    assert data["user"]["email"] == test_email
