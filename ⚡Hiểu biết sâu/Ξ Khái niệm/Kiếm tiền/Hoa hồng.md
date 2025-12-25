---
share: true
created: 2024-11-17T22:05
updated: 2025-12-19T11:32
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
