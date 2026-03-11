from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import simple_icd_10_cm as cm
import os

app = FastAPI(title="PsycheSync", version="1.0.0")

# Read allowed origins from environment variable, with fallback for local development
allowed_origins = os.environ.get(
    "ALLOWED_ORIGINS",
    "http://localhost:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CodeResult(BaseModel):
    code: str
    description: str


class CodeDetails(BaseModel):
    code: str
    description: str
    parent: Optional[str]
    children: list[str]
    excludes1: list[str]
    excludes2: list[str]


def ensure_dot(code: str) -> str:
    """Return the dotted form of a code (e.g. 'F329' -> 'F32.9')."""
    return cm.add_dot(code) if "." not in code else code


@app.get("/")
def health_check():
    return {"status": "PsycheSync API Online."}


@app.get("/search/{query}", response_model=list[CodeResult])
def search_codes(query: str):
    all_codes = cm.get_all_codes(with_dots=True)
    q = query.lower()
    results = []
    for code in all_codes:
        if len(results) >= 100:
            break
        try:
            desc = cm.get_description(code)
        except Exception:
            continue
        if q in code.lower() or q in desc.lower():
            results.append(CodeResult(code=code, description=desc))
    return results


@app.get("/details/{code}", response_model=CodeDetails)
def get_details(code: str):
    dotted = ensure_dot(code)

    if not cm.is_valid_item(dotted):
        raise HTTPException(status_code=404, detail=f"Code '{dotted}' not found.")

    def safe_list(fn, *args) -> list[str]:
        try:
            result = fn(*args)
            if isinstance(result, list):
                return [ensure_dot(c) if cm.is_valid_item(c) else c for c in result]
            return []
        except Exception:
            return []

    parent_raw = cm.get_parent(dotted)
    parent = ensure_dot(parent_raw) if parent_raw and cm.is_valid_item(parent_raw) else parent_raw or None

    return CodeDetails(
        code=dotted,
        description=cm.get_description(dotted),
        parent=parent,
        children=safe_list(cm.get_children, dotted),
        excludes1=safe_list(cm.get_excludes1, dotted),
        excludes2=safe_list(cm.get_excludes2, dotted),
    )
