---
share: true
created: 2025-01-19T22:21
updated: 2026-10-25T15:16
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[2]
```
