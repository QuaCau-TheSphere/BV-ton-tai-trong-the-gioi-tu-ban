---
share: true
created: 2025-04-15T23:35
updated: 2025-04-20T15:51
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```