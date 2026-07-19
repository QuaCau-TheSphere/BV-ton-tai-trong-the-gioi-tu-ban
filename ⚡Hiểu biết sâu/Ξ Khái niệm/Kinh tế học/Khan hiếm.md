---
share: true
updated: 2026-07-12T13:20
created: 2025-10-25T11:31
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[0]
```
