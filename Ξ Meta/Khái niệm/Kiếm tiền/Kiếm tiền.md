---
share: true
created: 2025-04-24T15:04
updated: 2026-10-25T14:42
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[0]
```
