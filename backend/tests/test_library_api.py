"""Backend API tests for Biblioteca Escolar RGB."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://learning-hub-550.preview.agent.com").rstrip("/")
API = f"{BASE_URL}/api"

GRADO = "g1"
MATERIA = "test_matematicas"
MATERIA2 = "test_lengua"
URL_OK = "https://drive.google.com/test-file-1"
URL_OK2 = "https://drive.google.com/test-file-2"


@pytest.fixture(autouse=True, scope="module")
def cleanup():
    # cleanup before/after
    for m in [MATERIA, MATERIA2]:
        requests.delete(f"{API}/links/{GRADO}/{m}")
    yield
    for m in [MATERIA, MATERIA2]:
        requests.delete(f"{API}/links/{GRADO}/{m}")


def test_root():
    r = requests.get(f"{API}/")
    assert r.status_code == 200
    assert r.json().get("message") == "Biblioteca Escolar RGB API"


def test_get_all_links_returns_dict():
    r = requests.get(f"{API}/links")
    assert r.status_code == 200
    assert isinstance(r.json(), dict)


def test_post_invalid_url_returns_400():
    r = requests.post(f"{API}/links", json={"grado_id": GRADO, "materia_id": MATERIA, "url": "ftp://bad"})
    assert r.status_code == 400


def test_post_valid_url_and_persistence():
    # Create
    r = requests.post(f"{API}/links", json={"grado_id": GRADO, "materia_id": MATERIA, "url": URL_OK})
    assert r.status_code == 200
    data = r.json()
    assert data["grado_id"] == GRADO
    assert data["materia_id"] == MATERIA
    assert data["url"] == URL_OK
    assert "id" in data and "updated_at" in data

    # GET all - nested dict format
    r2 = requests.get(f"{API}/links")
    assert r2.status_code == 200
    all_links = r2.json()
    assert GRADO in all_links
    assert all_links[GRADO].get(MATERIA) == URL_OK

    # GET by grado
    r3 = requests.get(f"{API}/links/{GRADO}")
    assert r3.status_code == 200
    g = r3.json()
    assert g.get(MATERIA) == URL_OK


def test_upsert_does_not_duplicate():
    # Save again with new URL - should update
    r = requests.post(f"{API}/links", json={"grado_id": GRADO, "materia_id": MATERIA, "url": URL_OK2})
    assert r.status_code == 200
    assert r.json()["url"] == URL_OK2

    r2 = requests.get(f"{API}/links/{GRADO}")
    assert r2.json().get(MATERIA) == URL_OK2

    # Confirm only one entry by counting via all-links nested dict
    all_links = requests.get(f"{API}/links").json()
    grado_dict = all_links.get(GRADO, {})
    # Only one value for that materia key
    assert grado_dict.get(MATERIA) == URL_OK2


def test_delete_link():
    # Ensure exists
    requests.post(f"{API}/links", json={"grado_id": GRADO, "materia_id": MATERIA, "url": URL_OK})
    r = requests.delete(f"{API}/links/{GRADO}/{MATERIA}")
    assert r.status_code == 200
    body = r.json()
    assert body.get("deleted") == 1

    # Confirm gone
    r2 = requests.get(f"{API}/links/{GRADO}")
    assert MATERIA not in r2.json()


def test_delete_nonexistent_returns_zero():
    r = requests.delete(f"{API}/links/{GRADO}/does_not_exist_xyz")
    assert r.status_code == 200
    assert r.json().get("deleted") == 0
