---
share: true
created: 2025-04-20T15:52
updated: 2025-04-20T15:52
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```