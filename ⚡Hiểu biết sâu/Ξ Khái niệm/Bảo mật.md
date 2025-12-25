---
share: true
created: 2025-01-23T15:21
updated: 2025-12-19T15:11
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
