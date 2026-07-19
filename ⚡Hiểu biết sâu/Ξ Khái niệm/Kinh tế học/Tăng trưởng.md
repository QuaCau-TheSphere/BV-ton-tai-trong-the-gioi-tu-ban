---
share: true
updated: 2026-07-08T21:12
created: 2025-08-29T08:30
---
[[GDP]]
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[1]
```
