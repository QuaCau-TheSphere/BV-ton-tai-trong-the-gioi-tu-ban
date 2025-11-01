---
share: true
created: 2025-03-27T17:13
updated: 2025-11-01T11:35
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
