---
share: true
created: 2025-08-29T08:30
updated: 2026-07-27T14:56
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[0]
```
