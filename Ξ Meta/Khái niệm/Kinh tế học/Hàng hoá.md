---
share: true
updated: 2026-10-25T14:38
created: 2025-10-20T09:52
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[1]
```
