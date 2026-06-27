---
share: true
created: 2025-04-24T15:04
updated: 2026-06-27T17:17
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
