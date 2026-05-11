---
share: true
created: 2025-04-25T21:45
updated: 2026-04-14T14:38
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
