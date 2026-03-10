import pytest
from httpx import AsyncClient
from app import app
from unittest.mock import patch, MagicMock

@pytest.mark.asyncio
async def test_semantic_similarity_exact_match():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/semantic-similarity", json={
            "reference_answers": ["नमस्ते"],
            "user_answer": "namaste",
            "keywords": ["नमस्ते"],
            "threshold": 0.60
        })
    
    assert response.status_code == 200
    data = response.json()
    assert data["semantic_similarity"] > 0.8
    assert "नमस्ते" in data["matched_keywords"]
    assert data["keyword_similarity_score"] == 1.0

@pytest.mark.asyncio
async def test_semantic_similarity_digit_normalization():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/semantic-similarity", json={
            "reference_answers": ["मेरे पास दो किताबें हैं"],
            "user_answer": "mere paas 2 kitabein hain",
            "keywords": ["दो", "किताबें"],
            "threshold": 0.60
        })
    
    assert response.status_code == 200
    data = response.json()
    assert data["semantic_similarity"] > 0.5
    assert len(data["matched_keywords"]) > 0
    assert "दो" in data["matched_keywords"] or "किताबें" in data["matched_keywords"]
