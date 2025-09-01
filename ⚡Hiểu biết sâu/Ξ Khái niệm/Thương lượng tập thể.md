---
share: true
created: 2025-03-27T17:13
updated: 2025-08-20T10:33
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
