---
share: true
updated: 2026-07-07T12:58
created: 2025-12-20T15:28
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
