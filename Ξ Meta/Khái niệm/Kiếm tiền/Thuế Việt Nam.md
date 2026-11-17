---
share: true
updated: 2026-09-18T21:30
created: 2025-10-02T13:49
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[1]
```
