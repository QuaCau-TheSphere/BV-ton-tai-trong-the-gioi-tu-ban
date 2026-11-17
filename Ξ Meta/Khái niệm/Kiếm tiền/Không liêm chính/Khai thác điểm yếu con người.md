---
share: true
updated: 2026-10-06T00:17
created: 2025-11-01T10:32
---
[[Chặn rác, chống thiết kế trục lợi]]
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
