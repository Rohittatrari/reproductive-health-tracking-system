from fastapi.testclient import TestClient
from app.main import app

def test_api_endpoints():
    with TestClient(app) as client:
        # 1. Root
        r = client.get("/")
        assert r.status_code == 200
        assert r.json()["status"] == "online"

        # 2. Login
        login_resp = client.post("/api/auth/login", json={
            "email": "demo@health.org",
            "password": "Demo@12345"
        })
        assert login_resp.status_code == 200
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 3. Dashboard
        dash_resp = client.get("/api/dashboard/summary", headers=headers)
        assert dash_resp.status_code == 200
        data = dash_resp.json()
        assert data["current_cycle_day"] is not None
        assert "phase_name" in data

        # 4. Symptoms
        sym_resp = client.get("/api/symptoms")
        assert sym_resp.status_code == 200
        assert len(sym_resp.json()) >= 10

        # 5. Education
        edu_resp = client.get("/api/education/articles")
        assert edu_resp.status_code == 200
        assert len(edu_resp.json()) >= 4

        # 6. AI Assistant
        chat_resp = client.post("/api/assistant/chat", json={
            "message": "Why do I get bad cramps during my period?"
        }, headers=headers)
        assert chat_resp.status_code == 200
        assert chat_resp.json()["disclaimer_included"] is True
