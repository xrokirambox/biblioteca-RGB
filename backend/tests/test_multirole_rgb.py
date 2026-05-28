"""
Pytest suite for Biblioteca Escolar RGB — multi-role admin system (iteration 4).
Covers: auth (admin/rector), users CRUD with role restrictions, books/links
created_by/updated_by, audit log endpoint + entries, public endpoints.

Run:
  REACT_APP_BACKEND_URL=<url> pytest /app/backend/tests/test_multirole_rgb.py -v \
    --junitxml=/app/test_reports/pytest/multirole_rgb.xml
"""
import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
assert BASE_URL, "REACT_APP_BACKEND_URL must be set"
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@rgb.edu"
ADMIN_PASS = "admin123"
RECTOR_EMAIL = "rector@rgb.edu"
RECTOR_PASS = "rector123"


# --------- Fixtures ---------
@pytest.fixture(scope="session")
def s():
    return requests.Session()


def _login(s, email, pw):
    r = s.post(f"{API}/auth/login", json={"email": email, "password": pw})
    assert r.status_code == 200, f"login {email} failed: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data
    return data["token"], data


@pytest.fixture(scope="session")
def admin_auth(s):
    token, data = _login(s, ADMIN_EMAIL, ADMIN_PASS)
    return {"token": token, "user": data, "headers": {"Authorization": f"Bearer {token}"}}


@pytest.fixture(scope="session")
def rector_auth(s):
    token, data = _login(s, RECTOR_EMAIL, RECTOR_PASS)
    return {"token": token, "user": data, "headers": {"Authorization": f"Bearer {token}"}}


@pytest.fixture
def admin_h(admin_auth):
    return admin_auth["headers"]


@pytest.fixture
def rector_h(rector_auth):
    return rector_auth["headers"]


# --------- Auth ---------
class TestAuth:
    def test_login_admin(self, s):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS})
        assert r.status_code == 200
        d = r.json()
        assert d["role"] == "admin"
        assert d["email"] == ADMIN_EMAIL
        assert isinstance(d["token"], str) and len(d["token"]) > 20

    def test_login_rector(self, s):
        r = requests.post(f"{API}/auth/login", json={"email": RECTOR_EMAIL, "password": RECTOR_PASS})
        assert r.status_code == 200
        d = r.json()
        assert d["role"] == "rector"
        assert d["email"] == RECTOR_EMAIL

    def test_login_wrong_password(self):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_login_unknown_user(self):
        r = requests.post(f"{API}/auth/login", json={"email": "ghost@rgb.edu", "password": "x"})
        assert r.status_code == 401

    def test_me_admin(self, admin_h):
        r = requests.get(f"{API}/auth/me", headers=admin_h)
        assert r.status_code == 200
        assert r.json()["role"] == "admin"
        assert "password_hash" not in r.json()

    def test_me_no_auth(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_logout(self, admin_auth):
        # logout is fire-and-forget; just verify endpoint returns ok and audits
        r = requests.post(f"{API}/auth/logout", headers=admin_auth["headers"])
        assert r.status_code == 200
        assert r.json().get("ok") is True


# --------- Users ---------
class TestUsers:
    def test_list_users_admin(self, admin_h):
        r = requests.get(f"{API}/users", headers=admin_h)
        assert r.status_code == 200
        users = r.json()
        emails = {u["email"] for u in users}
        assert ADMIN_EMAIL in emails and RECTOR_EMAIL in emails
        # password_hash must NOT leak
        for u in users:
            assert "password_hash" not in u

    def test_list_users_rector(self, rector_h):
        r = requests.get(f"{API}/users", headers=rector_h)
        assert r.status_code == 200
        assert len(r.json()) >= 2

    def test_list_users_no_auth(self):
        r = requests.get(f"{API}/users")
        assert r.status_code == 401

    def test_admin_creates_rector(self, admin_h):
        email = f"TEST_admin_made_{uuid.uuid4().hex[:6]}@rgb.edu"
        r = requests.post(f"{API}/users", headers=admin_h,
                          json={"email": email, "password": "pw123456", "role": "rector", "name": "T"})
        assert r.status_code == 200
        data = r.json()
        assert data["email"].lower() == email.lower() and data["role"] == "rector"
        # cleanup
        requests.delete(f"{API}/users/{data['id']}", headers=admin_h)

    def test_admin_creates_admin(self, admin_h):
        email = f"TEST_admin2_{uuid.uuid4().hex[:6]}@rgb.edu"
        r = requests.post(f"{API}/users", headers=admin_h,
                          json={"email": email, "password": "pw123456", "role": "admin"})
        assert r.status_code == 200
        assert r.json()["role"] == "admin"
        requests.delete(f"{API}/users/{r.json()['id']}", headers=admin_h)

    def test_rector_cannot_create_admin(self, rector_h):
        email = f"TEST_escalation_{uuid.uuid4().hex[:6]}@rgb.edu"
        r = requests.post(f"{API}/users", headers=rector_h,
                          json={"email": email, "password": "pw123456", "role": "admin"})
        assert r.status_code == 403
        assert "rector" in r.json().get("detail", "").lower()

    def test_rector_can_create_rector(self, rector_h, admin_h):
        email = f"TEST_rector_made_{uuid.uuid4().hex[:6]}@rgb.edu"
        r = requests.post(f"{API}/users", headers=rector_h,
                          json={"email": email, "password": "pw123456", "role": "rector"})
        assert r.status_code == 200
        assert r.json()["role"] == "rector"
        # cleanup via admin
        requests.delete(f"{API}/users/{r.json()['id']}", headers=admin_h)

    def test_invalid_role_rejected(self, admin_h):
        email = f"TEST_badrole_{uuid.uuid4().hex[:6]}@rgb.edu"
        r = requests.post(f"{API}/users", headers=admin_h,
                          json={"email": email, "password": "pw123456", "role": "superuser"})
        assert r.status_code == 400

    def test_duplicate_email_409(self, admin_h):
        r = requests.post(f"{API}/users", headers=admin_h,
                          json={"email": ADMIN_EMAIL, "password": "x", "role": "rector"})
        assert r.status_code == 409

    def test_admin_can_change_role_and_password(self, admin_h):
        # create a rector, then promote to admin
        email = f"TEST_promote_{uuid.uuid4().hex[:6]}@rgb.edu"
        c = requests.post(f"{API}/users", headers=admin_h,
                          json={"email": email, "password": "pw123456", "role": "rector"})
        uid = c.json()["id"]
        r = requests.put(f"{API}/users/{uid}", headers=admin_h,
                         json={"role": "admin", "password": "newpw7890"})
        assert r.status_code == 200
        assert r.json()["role"] == "admin"
        # Verify new password works
        lg = requests.post(f"{API}/auth/login", json={"email": email, "password": "newpw7890"})
        assert lg.status_code == 200 and lg.json()["role"] == "admin"
        requests.delete(f"{API}/users/{uid}", headers=admin_h)

    def test_rector_cannot_change_role(self, rector_h, admin_h):
        email = f"TEST_norolechg_{uuid.uuid4().hex[:6]}@rgb.edu"
        c = requests.post(f"{API}/users", headers=admin_h,
                          json={"email": email, "password": "pw123456", "role": "rector"})
        uid = c.json()["id"]
        r = requests.put(f"{API}/users/{uid}", headers=rector_h, json={"role": "admin"})
        assert r.status_code == 403
        # but name update should work
        r2 = requests.put(f"{API}/users/{uid}", headers=rector_h, json={"name": "Updated By Rector"})
        assert r2.status_code == 200
        assert r2.json()["name"] == "Updated By Rector"
        requests.delete(f"{API}/users/{uid}", headers=admin_h)

    def test_rector_cannot_delete(self, rector_h, admin_h):
        email = f"TEST_nodel_{uuid.uuid4().hex[:6]}@rgb.edu"
        c = requests.post(f"{API}/users", headers=admin_h,
                          json={"email": email, "password": "pw123456", "role": "rector"})
        uid = c.json()["id"]
        r = requests.delete(f"{API}/users/{uid}", headers=rector_h)
        assert r.status_code == 403
        assert "permisos" in r.json().get("detail", "").lower()
        # cleanup
        requests.delete(f"{API}/users/{uid}", headers=admin_h)

    def test_admin_can_delete_user(self, admin_h):
        email = f"TEST_del_{uuid.uuid4().hex[:6]}@rgb.edu"
        c = requests.post(f"{API}/users", headers=admin_h,
                          json={"email": email, "password": "pw123456", "role": "rector"})
        uid = c.json()["id"]
        r = requests.delete(f"{API}/users/{uid}", headers=admin_h)
        assert r.status_code == 200
        assert r.json().get("deleted") == 1

    def test_admin_cannot_delete_self(self, admin_h, admin_auth):
        uid = admin_auth["user"]["id"]
        r = requests.delete(f"{API}/users/{uid}", headers=admin_h)
        assert r.status_code == 400
        assert "propio" in r.json().get("detail", "").lower()


# --------- Books with audit fields ---------
class TestBooksAudit:
    def test_create_book_admin_sets_created_and_updated_by(self, admin_h, admin_auth):
        admin_id = admin_auth["user"]["id"]
        payload = {"title": f"TEST_Book_{uuid.uuid4().hex[:6]}", "author": "A", "category": "ciencias"}
        r = requests.post(f"{API}/books", headers=admin_h, json=payload)
        assert r.status_code == 200
        d = r.json()
        assert d["created_by"] == admin_id
        assert d["updated_by"] == admin_id
        # cleanup
        requests.delete(f"{API}/books/{d['id']}", headers=admin_h)

    def test_rector_updates_book_keeps_created_by(self, admin_h, rector_h, admin_auth, rector_auth):
        admin_id = admin_auth["user"]["id"]
        rector_id = rector_auth["user"]["id"]
        c = requests.post(f"{API}/books", headers=admin_h,
                          json={"title": f"TEST_Update_{uuid.uuid4().hex[:6]}"})
        bid = c.json()["id"]
        r = requests.put(f"{API}/books/{bid}", headers=rector_h, json={"title": "TEST_Updated_By_Rector"})
        assert r.status_code == 200
        d = r.json()
        assert d["created_by"] == admin_id, "created_by must NOT change on update"
        assert d["updated_by"] == rector_id, "updated_by must reflect rector"
        # cleanup
        requests.delete(f"{API}/books/{bid}", headers=admin_h)

    def test_rector_can_delete_book(self, admin_h, rector_h):
        c = requests.post(f"{API}/books", headers=admin_h,
                          json={"title": f"TEST_RectorDel_{uuid.uuid4().hex[:6]}"})
        bid = c.json()["id"]
        r = requests.delete(f"{API}/books/{bid}", headers=rector_h)
        assert r.status_code == 200

    def test_book_write_no_auth(self):
        for verb in ("post", "put", "delete"):
            if verb == "post":
                r = requests.post(f"{API}/books", json={"title": "x"})
            elif verb == "put":
                r = requests.put(f"{API}/books/abc", json={"title": "x"})
            else:
                r = requests.delete(f"{API}/books/abc")
            assert r.status_code == 401, f"{verb} expected 401, got {r.status_code}"


# --------- Links with audit fields ---------
class TestLinksAudit:
    GRADO = "g1"
    MATERIA = f"test_mat_{uuid.uuid4().hex[:6]}"

    def test_admin_upsert_then_rector_update_preserves_created_by(
        self, admin_h, rector_h, admin_auth, rector_auth
    ):
        admin_id = admin_auth["user"]["id"]
        rector_id = rector_auth["user"]["id"]
        url1 = "https://example.com/admin.pdf"
        r1 = requests.post(f"{API}/links", headers=admin_h,
                           json={"grado_id": self.GRADO, "materia_id": self.MATERIA, "url": url1})
        assert r1.status_code == 200
        d1 = r1.json()
        assert d1["created_by"] == admin_id and d1["updated_by"] == admin_id

        # rector updates
        url2 = "https://example.com/rector.pdf"
        r2 = requests.post(f"{API}/links", headers=rector_h,
                           json={"grado_id": self.GRADO, "materia_id": self.MATERIA, "url": url2})
        assert r2.status_code == 200
        d2 = r2.json()
        assert d2["created_by"] == admin_id, "created_by must persist on link upsert"
        assert d2["updated_by"] == rector_id
        assert d2["url"] == url2

        # rector can delete
        r3 = requests.delete(f"{API}/links/{self.GRADO}/{self.MATERIA}", headers=rector_h)
        assert r3.status_code == 200
        assert r3.json().get("deleted") == 1

    def test_link_post_no_auth(self):
        r = requests.post(f"{API}/links", json={"grado_id": "g1", "materia_id": "x", "url": "https://a"})
        assert r.status_code == 401


# --------- Audit Log ---------
class TestAuditLog:
    def test_audit_requires_auth(self):
        r = requests.get(f"{API}/audit")
        assert r.status_code == 401

    def test_audit_admin_and_rector_read(self, admin_h, rector_h):
        for h in (admin_h, rector_h):
            r = requests.get(f"{API}/audit", headers=h)
            assert r.status_code == 200
            assert isinstance(r.json(), list)

    def test_audit_sorted_desc(self, admin_h):
        r = requests.get(f"{API}/audit?limit=50", headers=admin_h)
        assert r.status_code == 200
        ts = [e["timestamp"] for e in r.json()]
        assert ts == sorted(ts, reverse=True), "audit must be desc by timestamp"

    def test_audit_records_book_lifecycle(self, admin_h):
        title = f"TEST_AuditBook_{uuid.uuid4().hex[:6]}"
        c = requests.post(f"{API}/books", headers=admin_h, json={"title": title})
        bid = c.json()["id"]
        requests.put(f"{API}/books/{bid}", headers=admin_h, json={"title": title + "_v2"})
        requests.delete(f"{API}/books/{bid}", headers=admin_h)
        time.sleep(0.3)
        r = requests.get(f"{API}/audit?limit=100", headers=admin_h)
        actions = [(e["action"], e["resource_type"], e["resource_id"]) for e in r.json()]
        assert ("create", "book", bid) in actions
        assert ("update", "book", bid) in actions
        assert ("delete", "book", bid) in actions

    def test_audit_records_login(self, admin_h):
        # trigger a fresh login
        requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS})
        time.sleep(0.2)
        r = requests.get(f"{API}/audit?limit=20", headers=admin_h)
        actions = [(e["action"], e["resource_type"]) for e in r.json()]
        assert ("login", "auth") in actions


# --------- Public endpoints unaffected ---------
class TestPublic:
    def test_get_books_public(self):
        r = requests.get(f"{API}/books")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_get_links_public(self):
        r = requests.get(f"{API}/links")
        assert r.status_code == 200
        assert isinstance(r.json(), dict)
