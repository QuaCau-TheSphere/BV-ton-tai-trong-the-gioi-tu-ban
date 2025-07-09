---
share: true
created: 2025-01-19T21:45
updated: 2025-01-19T21:45
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
