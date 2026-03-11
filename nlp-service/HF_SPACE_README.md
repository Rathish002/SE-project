---
title: se-project-nlp
emoji: 🧠
colorFrom: blue
colorTo: green
sdk: docker
app_port: 7860
pinned: false
---

# SE Project NLP Service (FastAPI)

This Space runs a FastAPI service for semantic similarity scoring.

## Endpoints
- `GET /` status endpoint
- `GET /health` health endpoint
- `POST /semantic-similarity` scoring endpoint

## Model selection
Set env var `SENTENCE_MODEL_NAME` in Space settings if you want to override default.

Default model used here:
- `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`

For higher accuracy (higher RAM/cold start), you can switch to:
- `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`
