---
share: true
created: 2025-01-19T22:21
updated: 2025-01-19T22:21
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
