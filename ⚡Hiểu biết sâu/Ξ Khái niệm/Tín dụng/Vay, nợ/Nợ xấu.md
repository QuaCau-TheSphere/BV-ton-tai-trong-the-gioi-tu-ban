---
share: true
created: 2025-04-11T21:26
updated: 2026-07-07T12:59
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
