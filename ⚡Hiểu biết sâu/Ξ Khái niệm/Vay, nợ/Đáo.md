---
share: true
created: 2025-04-15T23:35
updated: 2026-06-03T15:10
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
