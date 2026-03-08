from fastapi import FastAPI,Form,UploadFile,File
from pydantic import BaseModel
from utils.transliterate import roman_to_hindi
import whisper
from fastapi import UploadFile, File
import re
import os
import ast

app = FastAPI()


whisper_model = whisper.load_model("base")
# Original / baseline model
model = SentenceTransformer(
    "sentence-transformers/paraphrase-multilingual-mpnet-base-v2"
)
# Earlier model you tried:
# "sentence-transformers/distiluse-base-multilingual-cased-v2"

class SimilarityRequest(BaseModel):
    reference_answers: list[str] #already hindi
    user_answer: str   #may be romanized
    keywords: list[str] = []   


def is_romanized(text: str) -> bool:
    return bool(re.match(r"^[a-zA-Z\s]+$", text))

@app.post("/semantic-similarity")
def semantic_similarity(req: SimilarityRequest):
    from sentence_transformers import util

    model = get_model()

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

     # ===== SEMANTIC KEYWORD MATCHING =====
    matched_keywords = []
    keyword_score = 0
    keyword_similarities = []

    if req.keywords:
        keyword_embs = model.encode(req.keywords, convert_to_tensor=True)
        keyword_similarities = util.cos_sim(user_emb, keyword_embs)[0]

        for idx, score in enumerate(keyword_similarities):
            if float(score) > 0.6:   # threshold (tunable)
                matched_keywords.append(req.keywords[idx])
                keyword_score += 1

        keyword_score = keyword_score / len(req.keywords)
    
    print("Normalized User:", normalized_user)
    print("Keywords:", req.keywords)
    print("Keyword similarities:", keyword_similarities)

    return {
        "semantic_similarity": max_similarity,
        "keyword_similarity_score": keyword_score,
        "matched_keywords": matched_keywords,
        "normalized_user_answer": normalized_user
    }

@app.post("/speech-similarity")
async def speech_similarity(
    audio: UploadFile = File(...),
    reference_answers: str = Form(...),
    keywords: str = Form("[]")
):

    # Save temporary audio
    audio_path = f"temp_{audio.filename}"

    with open(audio_path, "wb") as f:
        f.write(await audio.read())

    # Speech → text
    result = whisper_model.transcribe(audio_path, language="hi")
    transcript = result["text"].strip()

    os.remove(audio_path)

    # Convert strings to lists
    reference_answers = ast.literal_eval(reference_answers)
    keywords = ast.literal_eval(keywords)

    # 🔁 Same transliteration logic
    if is_romanized(transcript):
        normalized_user = roman_to_hindi(transcript)
    else:
        normalized_user = transcript

    # 🔢 Generate embeddings
    user_emb = model.encode(normalized_user, convert_to_tensor=True)
    ref_embs = model.encode(reference_answers, convert_to_tensor=True)

    similarities = util.cos_sim(user_emb, ref_embs)[0]
    max_similarity = float(similarities.max())

    # ===== SEMANTIC KEYWORD MATCHING =====
    matched_keywords = []
    keyword_score = 0

    if keywords:
        keyword_embs = model.encode(keywords, convert_to_tensor=True)
        keyword_similarities = util.cos_sim(user_emb, keyword_embs)[0]

        for idx, score in enumerate(keyword_similarities):
            if float(score) > 0.6:
                matched_keywords.append(keywords[idx])
                keyword_score += 1

        keyword_score = keyword_score / len(keywords)

    print("Transcript:", transcript)
    print("Normalized User:", normalized_user)
    print("Keywords:", keywords)

    return {
        "transcript": transcript,
        "semantic_similarity": max_similarity,
        "keyword_similarity_score": keyword_score,
        "matched_keywords": matched_keywords,
        "normalized_user_answer": normalized_user
    }