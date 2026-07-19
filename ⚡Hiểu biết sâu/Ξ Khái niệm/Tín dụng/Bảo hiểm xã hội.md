---
share: true
updated: 2026-07-18T20:24
created: 2025-07-21T12:41
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
