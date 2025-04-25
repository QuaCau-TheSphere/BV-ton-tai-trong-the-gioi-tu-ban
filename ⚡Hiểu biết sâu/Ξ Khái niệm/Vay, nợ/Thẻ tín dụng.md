---
share: true
created: 2024-09-06T13:34
updated: 2025-04-20T15:51
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```