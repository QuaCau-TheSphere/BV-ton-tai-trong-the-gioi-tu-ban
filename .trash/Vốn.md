---
share: true
created: 2024-09-11T13:40
updated: 2024-09-11T13:40
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
