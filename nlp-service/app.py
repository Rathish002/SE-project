from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
from utils.transliterate import roman_to_hindi
import re

app = FastAPI()

# Original / baseline model
model = SentenceTransformer(
    "sentence-transformers/paraphrase-multilingual-mpnet-base-v2"
)
# Earlier model you tried:
# "sentence-transformers/distiluse-base-multilingual-cased-v2"

class SimilarityRequest(BaseModel):
    reference_answers: list[str]   # already Hindi
    user_answer: str               # may be romanized

def is_romanized(text: str) -> bool:
    return bool(re.match(r"^[a-zA-Z\s]+$", text))

@app.post("/semantic-similarity")
def semantic_similarity(req: SimilarityRequest):
    # 🔁 Transliterate ONLY if user typed in Roman script
    if is_romanized(req.user_answer):
        normalized_user = roman_to_hindi(req.user_answer)
    else:
        normalized_user = req.user_answer

    # Reference answers are already in Hindi
    reference_answers = req.reference_answers

    # 🔢 Generate embeddings
    user_emb = model.encode(normalized_user, convert_to_tensor=True)
    ref_embs = model.encode(reference_answers, convert_to_tensor=True)

    similarities = util.cos_sim(user_emb, ref_embs)[0]
    max_similarity = float(similarities.max())

    return {
        "similarity": max_similarity,
        "normalized_user_answer": normalized_user
    }
