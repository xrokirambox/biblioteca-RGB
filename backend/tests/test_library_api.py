"""Backend API tests for Biblioteca Escolar RGB (Auth + Links + Books)."""
import os
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@rgb.edu"
ADMIN_PASSWORD = "admin123"

GRADO = "g1"
MATERIA = "test_matematicas"
MATERIA2 = "test_lengua"
URL_OK = "https://drive.google.com/test-file-1"
URL_OK2 = "https://drive.google.com/test-file-2"


# -------------------- Fixtures --------------------
@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text}")
    data = r.json()
    return data["token"]


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture(autouse=True, scope="module")
def cleanup_links():
    # Best-effort cleanup - needs admin token; done via session-level helper
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    headers = {}
    if r.status_code == 200:
        headers = {"Authorization": f"Bearer {r.json()['token']}"}
    for m in [MATERIA, MATERIA2]:
        requests.delete(f"{API}/links/{GRADO}/{m}", headers=headers)
    yield
    for m in [MATERIA, MATERIA2]:
        requests.delete(f"{API}/links/{GRADO}/{m}", headers=headers)


# -------------------- Public / Health --------------------
class TestHealth:
    def test_root(self):
        r = requests.get(f"{API}/")
        assert r.status_code == 200
        assert r.json().get("message") == "Biblioteca Escolar RGB API"


# -------------------- Auth --------------------
class TestAuth:
    def test_login_success(self):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200, r.text
        data = r.json()
        assert "token" in data and isinstance(data["token"], str) and len(data["token"]) > 10
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"
        assert "id" in data

    def test_login_wrong_password_401(self):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "WRONG"})
        assert r.status_code == 401
        assert "detail" in r.json()

    def test_login_nonexistent_email_401(self):
        r = requests.post(f"{API}/auth/login", json={"email": "nobody@rgb.edu", "password": "x"})
        assert r.status_code == 401

    def test_me_with_bearer(self, admin_headers):
        r = requests.get(f"{API}/auth/me", headers=admin_headers)
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"
        assert "password_hash" not in data

    def test_me_without_token_401(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_invalid_token_401(self):
        r = requests.get(f"{API}/auth/me", headers={"Authorization": "Bearer not.a.token"})
        assert r.status_code == 401


# -------------------- Links (public GET, admin write) --------------------
class TestLinks:
    def test_get_all_links_returns_dict(self):
        r = requests.get(f"{API}/links")
        assert r.status_code == 200
        assert isinstance(r.json(), dict)

    def test_post_link_without_token_401(self):
        r = requests.post(f"{API}/links", json={"grado_id": GRADO, "materia_id": MATERIA, "url": URL_OK})
        assert r.status_code == 401

    def test_delete_link_without_token_401(self):
        r = requests.delete(f"{API}/links/{GRADO}/{MATERIA}")
        assert r.status_code == 401

    def test_post_invalid_url_returns_400(self, admin_headers):
        r = requests.post(f"{API}/links",
                          json={"grado_id": GRADO, "materia_id": MATERIA, "url": "ftp://bad"},
                          headers=admin_headers)
        assert r.status_code == 400

    def test_post_valid_and_persist(self, admin_headers):
        r = requests.post(f"{API}/links",
                          json={"grado_id": GRADO, "materia_id": MATERIA, "url": URL_OK},
                          headers=admin_headers)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["url"] == URL_OK
        assert data["materia_id"] == MATERIA
        assert "id" in data and "updated_at" in data

        # GET all nested
        all_links = requests.get(f"{API}/links").json()
        assert all_links.get(GRADO, {}).get(MATERIA) == URL_OK

        # GET grado
        g = requests.get(f"{API}/links/{GRADO}").json()
        assert g.get(MATERIA) == URL_OK

    def test_upsert_no_duplicate(self, admin_headers):
        r = requests.post(f"{API}/links",
                          json={"grado_id": GRADO, "materia_id": MATERIA, "url": URL_OK2},
                          headers=admin_headers)
        assert r.status_code == 200
        g = requests.get(f"{API}/links/{GRADO}").json()
        assert g.get(MATERIA) == URL_OK2

    def test_delete_existing_link(self, admin_headers):
        requests.post(f"{API}/links",
                      json={"grado_id": GRADO, "materia_id": MATERIA, "url": URL_OK},
                      headers=admin_headers)
        r = requests.delete(f"{API}/links/{GRADO}/{MATERIA}", headers=admin_headers)
        assert r.status_code == 200
        assert r.json().get("deleted") == 1
        g = requests.get(f"{API}/links/{GRADO}").json()
        assert MATERIA not in g

    def test_delete_nonexistent_returns_zero(self, admin_headers):
        r = requests.delete(f"{API}/links/{GRADO}/does_not_exist_xyz", headers=admin_headers)
        assert r.status_code == 200
        assert r.json().get("deleted") == 0


# -------------------- Books (public GET, admin write) --------------------
class TestBooks:
    def test_get_books_public(self):
        r = requests.get(f"{API}/books")
        assert r.status_code == 200
        body = r.json()
        assert isinstance(body, list)
        assert len(body) >= 4  # seed

    def test_create_book_without_token_401(self):
        r = requests.post(f"{API}/books", json={"title": "TEST_unauth"})
        assert r.status_code == 401
        assert r.json().get("detail") == "No autenticado"

    def test_create_update_delete_book_admin(self, admin_headers):
        # CREATE
        payload = {
            "title": "TEST_Book 1",
            "author": "Tester",
            "category": "literatura",
            "cover": "https://example.com/c.jpg",
            "url": "https://example.com/b",
            "description": "temp",
        }
        r = requests.post(f"{API}/books", json=payload, headers=admin_headers)
        assert r.status_code == 200, r.text
        created = r.json()
        assert created["title"] == payload["title"]
        assert created["author"] == payload["author"]
        assert "id" in created and "created_at" in created and "updated_at" in created
        book_id = created["id"]

        # GET list contains it
        listing = requests.get(f"{API}/books").json()
        ids = [b["id"] for b in listing]
        assert book_id in ids

        # UPDATE partial
        r2 = requests.put(f"{API}/books/{book_id}",
                          json={"title": "TEST_Book 1 Updated"},
                          headers=admin_headers)
        assert r2.status_code == 200, r2.text
        updated = r2.json()
        assert updated["title"] == "TEST_Book 1 Updated"
        assert updated["author"] == payload["author"]  # unchanged

        # GET confirms persisted
        listing2 = requests.get(f"{API}/books").json()
        found = [b for b in listing2 if b["id"] == book_id][0]
        assert found["title"] == "TEST_Book 1 Updated"

        # DELETE
        r3 = requests.delete(f"{API}/books/{book_id}", headers=admin_headers)
        assert r3.status_code == 200
        assert r3.json().get("deleted") == 1

        # Second DELETE -> 404
        r4 = requests.delete(f"{API}/books/{book_id}", headers=admin_headers)
        assert r4.status_code == 404

    def test_update_nonexistent_book_404(self, admin_headers):
        r = requests.put(f"{API}/books/does_not_exist_xyz",
                         json={"title": "x"},
                         headers=admin_headers)
        assert r.status_code == 404

    def test_update_without_token_401(self):
        r = requests.put(f"{API}/books/anything", json={"title": "x"})
        assert r.status_code == 401

    def test_delete_without_token_401(self):
        r = requests.delete(f"{API}/books/anything")
        assert r.status_code == 401
