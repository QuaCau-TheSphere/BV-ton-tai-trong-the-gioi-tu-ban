---
share: true
updated: 2026-07-14T19:40
created: 2025-09-09T10:35
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[0]
```
