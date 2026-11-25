"""API tests for the Voallen backend.

Runs against an in-memory MongoDB stand-in, so no database is needed:
    pip install -r backend/requirements.txt -r tests/requirements.txt
    pytest tests
"""
import importlib.util
import os
import sys
from pathlib import Path

import pytest

os.environ.setdefault("MONGO_URL", "mongodb://localhost:27017")
os.environ.setdefault("DB_NAME", "voallen_test")
os.environ["ADMIN_EMAILS"] = "boss@example.com"
os.environ["JWT_SECRET"] = "test-secret-that-is-at-least-32-bytes-long"

import motor.motor_asyncio  # noqa: E402
import mongomock_motor  # noqa: E402

motor.motor_asyncio.AsyncIOMotorClient = mongomock_motor.AsyncMongoMockClient

from fastapi.testclient import TestClient  # noqa: E402


@pytest.fixture()
def client():
    path = Path(__file__).resolve().parent.parent / "backend" / "server.py"
    spec = importlib.util.spec_from_file_location("voallen_server", path)
    server = importlib.util.module_from_spec(spec)
    sys.modules["voallen_server"] = server
    spec.loader.exec_module(server)
    sent = []
    server._send_email_sync = lambda to, subject, body: sent.append((to, subject))
    with TestClient(server.app) as c:  # runs startup, which seeds sample data
        c.sent_emails = sent
        yield c


def signup(client, email, role="client", name="Test User"):
    r = client.post("/api/auth/signup", json={"email": email, "name": name, "password": "pw123456", "role": role})
    return r


def auth(token):
    return {"Authorization": f"Bearer {token}"}


def test_root_uses_voallen_name(client):
    assert "Voallen" in client.get("/api/").json()["message"]


def test_sample_agencies_seeded_on_startup(client):
    agencies = client.get("/api/agencies").json()
    assert len(agencies) == 22
    assert "Newark, NJ" in {a["city"] for a in agencies}


def test_cannot_self_assign_admin(client):
    assert signup(client, "sneaky@example.com", role="admin").status_code == 422


def test_admin_comes_from_admin_emails(client):
    r = signup(client, "boss@example.com")
    assert r.json()["user"]["is_admin"] is True and r.json()["user"]["role"] == "client"


def test_seed_requires_admin(client):
    assert client.post("/api/seed").status_code == 401
    token = signup(client, "c@example.com").json()["access_token"]
    assert client.post("/api/seed", headers=auth(token)).status_code == 403
    admin = signup(client, "boss@example.com").json()["access_token"]
    assert client.post("/api/seed", headers=auth(admin)).status_code == 200


def test_booking_lifecycle_and_review(client):
    agency_token = signup(client, "agency@example.com", role="agency", name="Agency Owner").json()["access_token"]
    agency = client.post("/api/agencies", headers=auth(agency_token), json={
        "name": "Test Care", "bio": "b", "location": "1 Main St", "city": "Newark, NJ",
        "experience_years": 3, "price_per_hour": 17, "image_url": "https://example.com/a.jpg",
        "rating": 5.0, "review_count": 999, "is_verified": True,
    }).json()
    # Self-reported ratings and verification are ignored
    assert agency["review_count"] == 0 and agency["is_verified"] is False
    assert agency["status"] == "pending_approval"
    admin = signup(client, "boss@example.com").json()["access_token"]
    assert client.patch(f"/api/admin/agencies/{agency['id']}", headers=auth(admin), json={"status": "available"}).status_code == 200
    client.sent_emails.clear()

    client_token = signup(client, "fam@example.com", name="Fam").json()["access_token"]
    booking = client.post("/api/bookings", headers=auth(client_token), json={
        "agency_id": agency["id"], "service_type": "Elderly Care", "date": "2026-12-01",
        "time_slot": "10:00 AM", "patient_name": "Grandma",
    }).json()
    assert {to for to, _ in client.sent_emails} == {"fam@example.com", "agency@example.com"}

    # Can't review before the visit is complete
    r = client.post("/api/reviews", headers=auth(client_token), json={"booking_id": booking["id"], "rating": 4, "comment": "ok"})
    assert r.status_code == 400

    # The client can't confirm their own booking; another agency can't either
    assert client.patch(f"/api/bookings/{booking['id']}/status", headers=auth(client_token), json={"status": "confirmed"}).status_code == 400
    other = signup(client, "other@example.com", role="agency").json()["access_token"]
    assert client.patch(f"/api/bookings/{booking['id']}/status", headers=auth(other), json={"status": "confirmed"}).status_code == 403

    incoming = client.get("/api/agency/bookings", headers=auth(agency_token)).json()
    assert [b["id"] for b in incoming] == [booking["id"]]
    assert incoming[0]["client"]["email"] == "fam@example.com"

    for status in ("confirmed", "completed"):
        r = client.patch(f"/api/bookings/{booking['id']}/status", headers=auth(agency_token), json={"status": status})
        assert r.status_code == 200 and r.json()["status"] == status

    r = client.post("/api/reviews", headers=auth(client_token), json={"booking_id": booking["id"], "rating": 4, "comment": "Lovely"})
    assert r.status_code == 200
    # Only one review per visit
    assert client.post("/api/reviews", headers=auth(client_token), json={"booking_id": booking["id"], "rating": 5, "comment": "again"}).status_code == 400

    page = client.get(f"/api/agencies/{agency['id']}").json()
    assert page["reviews"][0]["comment"] == "Lovely"
    assert page["rating"] == 4.0 and page["review_count"] == 1


def test_review_blends_into_seeded_rating(client):
    seeded = client.get("/api/agencies").json()[0]
    token = signup(client, "fam2@example.com").json()["access_token"]
    booking = client.post("/api/bookings", headers=auth(token), json={
        "agency_id": seeded["id"], "service_type": "Elderly Care", "date": "2026-12-01",
        "time_slot": "9:00 AM", "patient_name": "Pop",
    }).json()
    # Seeded agencies have no owner account, so mark complete directly for the test
    import voallen_server
    client.portal.call(voallen_server.db.bookings.update_one, {"id": booking["id"]}, {"$set": {"status": "completed"}})
    r = client.post("/api/reviews", headers=auth(token), json={"booking_id": booking["id"], "rating": 1, "comment": "meh"})
    assert r.status_code == 200
    after = client.get(f"/api/agencies/{seeded['id']}").json()
    expected = round((seeded["rating"] * seeded["review_count"] + 1) / (seeded["review_count"] + 1), 1)
    assert after["review_count"] == seeded["review_count"] + 1
    assert after["rating"] == expected
    assert after["rating"] > 4  # one low review doesn't wipe out 100+ seeded ones


def test_serves_frontend_build_with_spa_fallback(tmp_path, monkeypatch):
    (tmp_path / "index.html").write_text("<html>app shell</html>")
    (tmp_path / "static").mkdir()
    (tmp_path / "static" / "app.js").write_text("console.log(1)")
    monkeypatch.setenv("FRONTEND_BUILD_DIR", str(tmp_path))
    path = Path(__file__).resolve().parent.parent / "backend" / "server.py"
    spec = importlib.util.spec_from_file_location("voallen_server_static", path)
    server = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(server)
    with TestClient(server.app) as c:
        assert c.get("/api/health").json() == {"status": "ok"}
        assert c.get("/static/app.js").text == "console.log(1)"
        assert "app shell" in c.get("/dashboard").text
        assert c.get("/api/not-a-route").status_code == 404


def test_admin_dashboard_endpoints(client):
    # A non-admin can't use any admin route
    fam = signup(client, "fam3@example.com").json()["access_token"]
    for path in ("/api/admin/overview", "/api/admin/agencies", "/api/admin/bookings", "/api/admin/users", "/api/contact/messages"):
        assert client.get(path, headers=auth(fam)).status_code == 403

    # An agency account whose email is in ADMIN_EMAILS keeps its agency role but is also an admin
    r = signup(client, "boss@example.com", role="agency", name="Boss")
    assert r.json()["user"]["is_admin"] is True
    boss = r.json()["access_token"]
    assert client.get("/api/auth/me", headers=auth(boss)).json()["is_admin"] is True
    assert client.post("/api/auth/login", json={"email": "boss@example.com", "password": "pw123456"}).json()["user"]["is_admin"] is True

    overview = client.get("/api/admin/overview", headers=auth(boss)).json()
    assert overview["agencies"] == 22 and overview["clients"] == 1

    owner = signup(client, "own@example.com", role="agency", name="Owner").json()["access_token"]
    new = client.post("/api/agencies", headers=auth(owner), json={
        "name": "Fresh Care", "bio": "b", "location": "x", "city": "Newark, NJ",
        "experience_years": 1, "price_per_hour": 15, "image_url": "https://example.com/a.jpg",
    }).json()
    agencies = client.get("/api/admin/agencies", headers=auth(boss)).json()
    assert agencies[0]["id"] == new["id"]  # newest self-registered agency first
    assert agencies[0]["owner"]["email"] == "own@example.com"
    assert agencies[0]["is_verified"] is False

    assert agencies[0]["status"] == "pending_approval"
    r = client.patch(f"/api/admin/agencies/{new['id']}", headers=auth(boss), json={"is_verified": True, "status": "available"})
    assert r.status_code == 200 and r.json()["is_verified"] is True
    assert client.patch(f"/api/admin/agencies/{new['id']}", headers=auth(owner), json={"is_verified": True}).status_code == 403

    client.post("/api/bookings", headers=auth(fam), json={
        "agency_id": new["id"], "service_type": "Elderly Care", "date": "2026-12-01",
        "time_slot": "9:00 AM", "patient_name": "Pop",
    })
    bookings = client.get("/api/admin/bookings", headers=auth(boss)).json()
    assert bookings[0]["agency_name"] == "Fresh Care" and bookings[0]["client"]["email"] == "fam3@example.com"

    client.post("/api/contact", json={"name": "A", "email": "a@x.com", "subject": "Hi", "message": "Hello"})
    assert client.get("/api/contact/messages", headers=auth(boss)).json()[0]["subject"] == "Hi"
    users = client.get("/api/admin/users", headers=auth(boss)).json()
    assert all("password" not in u for u in users)


def test_agency_approval_availability_history_and_override(client):
    admin = signup(client, "boss@example.com").json()["access_token"]
    owner = signup(client, "o2@example.com", role="agency", name="Owner Two").json()["access_token"]
    fam = signup(client, "f2@example.com", name="Fam Two").json()["access_token"]
    agency = client.post("/api/agencies", headers=auth(owner), json={
        "name": "Hidden Care", "bio": "b", "location": "x", "city": "Newark, NJ",
        "experience_years": 1, "price_per_hour": 15, "image_url": "https://example.com/a.jpg",
    }).json()
    booking_body = {"agency_id": agency["id"], "service_type": "Elderly Care", "date": "2026-12-01",
                    "time_slot": "9:00 AM", "patient_name": "Pop"}

    # Pending approval: hidden from families, visible to owner and admin, not bookable
    assert agency["id"] not in {a["id"] for a in client.get("/api/agencies").json()}
    assert client.get(f"/api/agencies/{agency['id']}").status_code == 404
    assert client.get(f"/api/agencies/{agency['id']}", headers=auth(owner)).status_code == 200
    assert client.get(f"/api/agencies/{agency['id']}", headers=auth(admin)).status_code == 200
    assert client.post("/api/bookings", headers=auth(fam), json=booking_body).status_code == 400
    assert client.patch(f"/api/admin/agencies/{agency['id']}", headers=auth(owner), json={"status": "available"}).status_code == 403

    client.sent_emails.clear()
    client.patch(f"/api/admin/agencies/{agency['id']}", headers=auth(admin), json={"status": "available"})
    assert ("o2@example.com", "Your Voallen listing was updated") in client.sent_emails
    assert agency["id"] in {a["id"] for a in client.get("/api/agencies").json()}
    booking = client.post("/api/bookings", headers=auth(fam), json=booking_body).json()
    client.patch(f"/api/bookings/{booking['id']}/status", headers=auth(owner), json={"status": "declined"})

    # Admin sees the agency page with every booking and who decided what
    detail = client.get(f"/api/admin/agencies/{agency['id']}", headers=auth(admin)).json()
    assert detail["owner"]["email"] == "o2@example.com"
    assert detail["booking_counts"] == {"declined": 1}
    history = detail["bookings"][0]["history"]
    assert [(h["status"], h["by_role"], h["by_name"]) for h in history] == [
        ("pending", "client", "Fam Two"), ("declined", "agency", "Owner Two")]
    assert detail["bookings"][0]["client"]["email"] == "f2@example.com"
    assert client.get(f"/api/admin/agencies/{agency['id']}", headers=auth(owner)).status_code == 403

    # Admin override is recorded with a note
    r = client.patch(f"/api/admin/bookings/{booking['id']}/status", headers=auth(admin),
                     json={"status": "confirmed", "note": "Agency confirmed by phone"})
    assert r.status_code == 200
    last = r.json()["history"][-1]
    assert last["by_role"] == "admin" and last["note"] == "Agency confirmed by phone"
    assert client.patch(f"/api/admin/bookings/{booking['id']}/status", headers=auth(owner), json={"status": "cancelled"}).status_code == 403

    # Unavailable: hidden again and not bookable
    client.patch(f"/api/admin/agencies/{agency['id']}", headers=auth(admin), json={"status": "unavailable"})
    assert agency["id"] not in {a["id"] for a in client.get("/api/agencies").json()}
    assert client.post("/api/bookings", headers=auth(fam), json=booking_body).status_code == 400
