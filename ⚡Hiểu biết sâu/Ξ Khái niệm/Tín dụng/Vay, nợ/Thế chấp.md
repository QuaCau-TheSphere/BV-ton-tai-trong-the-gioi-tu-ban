---
share: true
updated: 2026-07-30T16:32
created: 2025-10-03T20:34
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
