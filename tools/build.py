#!/usr/bin/env python3
"""Build the bookmarklet and the GitHub Pages install page.

    python3 tools/build.py

Reads  src/subtitle-follow.js
Writes docs/bookmarklet.txt  (the javascript: URL)
       docs/index.html       (install page with the drag-to-bookmarks button)
"""
import html
import json
import pathlib
import re
import urllib.parse

REPO_URL = "https://github.com/1220H/echo360-subtitle-follow"

ROOT = pathlib.Path(__file__).resolve().parent.parent


def minify(js: str) -> str:
    # Conservative: drop block comments and full-line // comments, trim indentation.
    js = re.sub(r"/\*.*?\*/", "", js, flags=re.S)
    lines = []
    for line in js.split("\n"):
        s = line.strip()
        if not s or s.startswith("//"):
            continue
        s = re.sub(r"\s//[^'\"]*$", "", s)  # trailing // comment (only when no quotes follow)
        lines.append(s)
    code = "\n".join(lines)
    # Non-ASCII → \uXXXX (6 chars instead of 9 when URL-encoded). Only appears inside string/regex literals.
    return "".join(c if ord(c) < 128 else "".join("\\u%04x" % u for u in _utf16(c)) for c in code)


def _utf16(ch: str):
    b = ch.encode("utf-16-be")
    return [int.from_bytes(b[i:i + 2], "big") for i in range(0, len(b), 2)]


def main() -> None:
    src = (ROOT / "src" / "subtitle-follow.js").read_text(encoding="utf-8")
    code = minify(src)
    bookmarklet = "javascript:" + urllib.parse.quote(code, safe="()'*!~-_.;,/:=+$[]{}")
    (ROOT / "docs" / "bookmarklet.txt").write_text(bookmarklet + "\n", encoding="utf-8")

    tpl = (ROOT / "tools" / "index.tpl.html").read_text(encoding="utf-8")
    page = (
        tpl.replace("__BM_ATTR__", html.escape(bookmarklet, quote=True))
        .replace("__BM_JSON__", json.dumps(bookmarklet).replace("</", "<\\/"))
        .replace("__REPO_URL__", REPO_URL)
    )
    (ROOT / "docs" / "index.html").write_text(page, encoding="utf-8")
    print(f"bookmarklet: {len(bookmarklet):,} chars -> docs/bookmarklet.txt, docs/index.html")


if __name__ == "__main__":
    main()
