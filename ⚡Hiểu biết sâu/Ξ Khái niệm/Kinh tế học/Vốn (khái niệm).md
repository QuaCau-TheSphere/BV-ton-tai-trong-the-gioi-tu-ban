---
share: true
created: 2024-09-15T15:54
updated: 2026-07-07T12:58
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
