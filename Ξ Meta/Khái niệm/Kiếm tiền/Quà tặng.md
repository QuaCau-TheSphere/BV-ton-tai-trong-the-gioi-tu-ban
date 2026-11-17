---
share: true
updated: 2026-07-27T02:26
created: 2025-07-12T23:59
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
