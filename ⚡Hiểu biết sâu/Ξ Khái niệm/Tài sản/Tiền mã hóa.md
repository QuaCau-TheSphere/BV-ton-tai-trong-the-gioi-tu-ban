---
share: true
created: 2025-04-20T16:14
updated: 2026-01-07T19:47
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
