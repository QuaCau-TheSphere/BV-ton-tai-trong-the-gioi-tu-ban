---
share: true
updated: 2026-07-07T12:59
created: 2025-10-07T10:43
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
