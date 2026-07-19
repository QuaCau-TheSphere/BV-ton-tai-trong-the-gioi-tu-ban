---
share: true
created: 2025-04-15T23:35
updated: 2026-07-17T19:54
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[5]
```
