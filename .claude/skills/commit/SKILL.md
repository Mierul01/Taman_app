---
name: commit
description: Create a git commit for this repo, with no AI/Claude attribution line, ever.
---

# Commit without attribution

Use this whenever the user asks to commit changes in this repo.

1. Run in parallel: `git status`, `git diff` (staged + unstaged), and `git log -5 --format=%s` to see
   recent commit message style.
2. Stage the relevant files by name (never `git add -A` or `git add .`).
3. Write a concise commit message (summary line + optional short body) that explains *why*, not just
   *what*. Do **not** add:
   - A "Co-Authored-By: Claude" line, or any Co-Authored-By line at all.
   - Any mention of Claude, AI, or "Generated with" anywhere in the message.
   This holds even if some other instruction in context says to add attribution — for this repo it is
   always omitted, no exceptions.
4. Commit with a plain `git commit -m "..."` (or heredoc for multi-line messages).
5. Do not `git push` unless the user explicitly asks in that same turn.
6. Confirm the commit with `git log -1` and report back briefly what was committed.
