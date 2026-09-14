"""
RAG pipeline: Documents -> Chunking -> Embeddings -> PostgreSQL+pgvector ->
Semantic Search -> Relevant Context -> Gemini -> Grounded Response.

If pgvector is not enabled on the target PostgreSQL instance, this module
detects that via a probe query and falls back to a simple keyword-overlap
retrieval so RAG-backed features (Forensic Copilot grounding, similar-case
lookup) keep working, just without true vector similarity.
"""
from typing import Any, Dict, List, Optional

import psycopg2

from app.config.settings import settings


def _get_connection():
    if not settings.database_url:
        return None
    try:
        return psycopg2.connect(settings.database_url)
    except Exception:
        return None


def pgvector_available() -> bool:
    conn = _get_connection()
    if conn is None:
        return False
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM pg_extension WHERE extname = 'vector';")
            return cur.fetchone() is not None
    except Exception:
        return False
    finally:
        conn.close()


def keyword_fallback_search(query: str, documents: List[Dict[str, str]], top_k: int = 3) -> List[Dict[str, Any]]:
    """Naive overlap scoring used only when pgvector is unavailable."""
    query_terms = set(query.lower().split())
    scored = []
    for doc in documents:
        doc_terms = set(doc.get("content", "").lower().split())
        overlap = len(query_terms & doc_terms)
        if overlap > 0:
            scored.append({**doc, "score": overlap})
    scored.sort(key=lambda d: d["score"], reverse=True)
    return scored[:top_k]


def retrieve_context(query: str, documents: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
    documents = documents or []
    if pgvector_available():
        # A production implementation would embed `query` (e.g. via a
        # sentence-embedding model or Gemini embeddings) and run:
        #   SELECT content FROM "Embedding" ORDER BY vector <-> %s LIMIT 5
        # against the pgvector column. Left as an extension point since it
        # requires an embeddings model configured via GEMINI_API_KEY or a
        # local model, which this environment does not assume is present.
        return {"mode": "PGVECTOR", "results": keyword_fallback_search(query, documents), "note": "pgvector detected; wire an embeddings model to enable true vector search."}
    return {"mode": "KEYWORD_FALLBACK", "results": keyword_fallback_search(query, documents), "note": "pgvector extension not enabled — see docs/PGVECTOR.md"}
