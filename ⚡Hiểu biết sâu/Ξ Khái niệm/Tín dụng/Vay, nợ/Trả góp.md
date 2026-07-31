---
share: true
updated: 2026-07-30T16:32
created: 2025-09-22T10:58
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
