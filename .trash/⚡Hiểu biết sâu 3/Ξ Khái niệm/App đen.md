---
share: true
created: 2024-09-06T11:52
updated: 2024-09-06T11:54
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```