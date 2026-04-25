"""Backend tests for Biblioteca Escolar RGB - JWT auth, Books CRUD, Links public/admin."""
import os
import uuid
import pytest
import requests
from pymongo import MongoClient

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # Fallback: read from frontend/.env
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip().strip('"').rstrip("/")
                    break
    except Exception:
        pass
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@rgb.edu"
ADMIN_PASSWORD = "admin123"

GRADO = "g1"
TEST_MATERIA = "test_mat_iter3"


# ------------------ fixtures ------------------
@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture(autouse=True)
def cleanup_test_link(admin_token):
    yield
    headers = {"Authorization": f"Bearer {admin_token}"}
    try:
        requests.delete(f"{API}/links/{GRADO}/{TEST_MATERIA}", headers=headers)
    except Exception:
        pass


# ------------------ root ------------------
def test_root_returns_app_name():
    r = requests.get(f"{API}/")
    assert r.status_code == 200
    assert r.json().get("message") == "Biblioteca Escolar RGB API"


# ------------------ auth ------------------
class TestAuth:
    def test_login_success(self):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        d = r.json()
        assert d["email"] == ADMIN_EMAIL
        assert d["role"] == "admin"
        assert isinstance(d["token"], str) and len(d["token"]) > 20

    def test_login_wrong_password_401(self):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_login_unknown_email_401(self):
        r = requests.post(f"{API}/auth/login", json={"email": "ghost@rgb.edu", "password": "x"})
        assert r.status_code == 401

    def test_me_without_token_401(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_with_token_returns_user(self, admin_headers):
        r = requests.get(f"{API}/auth/me", headers=admin_headers)
        assert r.status_code == 200
        d = r.json()
        assert d["email"] == ADMIN_EMAIL
        assert d["role"] == "admin"
        assert "password_hash" not in d

    def test_me_invalid_token_401(self):
        r = requests.get(f"{API}/auth/me", headers={"Authorization": "Bearer bogus.token.value"})
        assert r.status_code == 401


# ------------------ links public/admin ------------------
class TestLinks:
    def test_get_links_public_no_auth(self):
        r = requests.get(f"{API}/links")
        assert r.status_code == 200
        assert isinstance(r.json(), dict)

    def test_post_link_without_auth_401(self):
        r = requests.post(f"{API}/links", json={"grado_id": GRADO, "materia_id": TEST_MATERIA, "url": "https://x.com"})
        assert r.status_code == 401

    def test_post_link_with_admin_creates(self, admin_headers):
        r = requests.post(f"{API}/links", json={"grado_id": GRADO, "materia_id": TEST_MATERIA, "url": "https://drive.google.com/test"}, headers=admin_headers)
        assert r.status_code == 200
        d = r.json()
        assert d["grado_id"] == GRADO
        assert d["materia_id"] == TEST_MATERIA
        assert d["url"] == "https://drive.google.com/test"
        # verify GET reflects it
        all_links = requests.get(f"{API}/links").json()
        assert all_links.get(GRADO, {}).get(TEST_MATERIA) == "https://drive.google.com/test"

    def test_post_link_invalid_url_400(self, admin_headers):
        r = requests.post(f"{API}/links", json={"grado_id": GRADO, "materia_id": TEST_MATERIA, "url": "ftp://bad"}, headers=admin_headers)
        assert r.status_code == 400

    def test_delete_link_without_auth_401(self):
        r = requests.delete(f"{API}/links/{GRADO}/{TEST_MATERIA}")
        assert r.status_code == 401

    def test_delete_link_with_admin(self, admin_headers):
        # ensure exists
        requests.post(f"{API}/links", json={"grado_id": GRADO, "materia_id": TEST_MATERIA, "url": "https://x.com/y"}, headers=admin_headers)
        r = requests.delete(f"{API}/links/{GRADO}/{TEST_MATERIA}", headers=admin_headers)
        assert r.status_code == 200
        assert r.json().get("deleted", 0) >= 1

    def test_legacy_field_handling(self, admin_headers):
        """Insert a legacy doc {grado, materia} directly into Mongo and verify GET returns it."""
        mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
        db_name = os.environ.get("DB_NAME", "test_database")
        client = MongoClient(mongo_url)
        db = client[db_name]
        legacy_materia = "legacy_test_iter3"
        legacy_url = "https://legacy.example.com"
        try:
            db.links.insert_one({"grado": GRADO, "materia": legacy_materia, "url": legacy_url})
            r = requests.get(f"{API}/links")
            assert r.status_code == 200
            assert r.json().get(GRADO, {}).get(legacy_materia) == legacy_url
        finally:
            db.links.delete_many({"grado": GRADO, "materia": legacy_materia})
            client.close()


# ------------------ books ------------------
class TestBooks:
    def test_list_books_public(self):
        r = requests.get(f"{API}/books")
        assert r.status_code == 200
        books = r.json()
        assert isinstance(books, list)
        assert len(books) >= 4
        titles = [b["title"] for b in books]
        assert "Cien Años de Soledad" in titles

    def test_post_book_without_auth_401(self):
        r = requests.post(f"{API}/books", json={"title": "TEST_NoAuth", "author": "x"})
        assert r.status_code == 401

    def test_post_book_with_admin(self, admin_headers):
        payload = {"title": f"TEST_Book_{uuid.uuid4().hex[:6]}", "author": "Tester", "category": "literatura", "url": "https://x.com"}
        r = requests.post(f"{API}/books", json=payload, headers=admin_headers)
        assert r.status_code == 200
        d = r.json()
        assert d["title"] == payload["title"]
        assert "id" in d
        # GET verify
        get_r = requests.get(f"{API}/books")
        assert any(b["id"] == d["id"] and b["title"] == payload["title"] for b in get_r.json())
        # cleanup
        requests.delete(f"{API}/books/{d['id']}", headers=admin_headers)

    def test_put_book_partial_update(self, admin_headers):
        # create
        cr = requests.post(f"{API}/books", json={"title": "TEST_Update", "author": "Orig"}, headers=admin_headers)
        bid = cr.json()["id"]
        # update only title
        ur = requests.put(f"{API}/books/{bid}", json={"title": "TEST_Updated"}, headers=admin_headers)
        assert ur.status_code == 200
        d = ur.json()
        assert d["title"] == "TEST_Updated"
        assert d["author"] == "Orig"  # untouched
        # GET verify
        gr = requests.get(f"{API}/books").json()
        match = next((b for b in gr if b["id"] == bid), None)
        assert match and match["title"] == "TEST_Updated" and match["author"] == "Orig"
        # cleanup
        requests.delete(f"{API}/books/{bid}", headers=admin_headers)

    def test_put_nonexistent_book_404(self, admin_headers):
        r = requests.put(f"{API}/books/nonexistent-xyz-{uuid.uuid4().hex[:6]}", json={"title": "x"}, headers=admin_headers)
        assert r.status_code == 404

    def test_delete_book_admin_only(self, admin_headers):
        cr = requests.post(f"{API}/books", json={"title": "TEST_Delete"}, headers=admin_headers)
        bid = cr.json()["id"]
        # without auth
        r401 = requests.delete(f"{API}/books/{bid}")
        assert r401.status_code == 401
        # with auth
        r = requests.delete(f"{API}/books/{bid}", headers=admin_headers)
        assert r.status_code == 200
        # second delete -> 404
        r2 = requests.delete(f"{API}/books/{bid}", headers=admin_headers)
        assert r2.status_code == 404
