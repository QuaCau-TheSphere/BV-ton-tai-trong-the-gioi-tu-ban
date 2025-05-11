---
share: true
created: 2024-09-06T13:34
updated: 2025-05-11T01:48
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```