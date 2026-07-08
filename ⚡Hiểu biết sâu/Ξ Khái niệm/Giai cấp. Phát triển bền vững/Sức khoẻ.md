---
share: true
updated: 2026-07-07T12:58
created: 2025-09-09T10:05
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
