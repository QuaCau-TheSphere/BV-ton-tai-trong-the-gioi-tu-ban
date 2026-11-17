---
share: true
created: 2025-04-22T12:43
updated: 2026-10-16T14:48
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[0]
```
