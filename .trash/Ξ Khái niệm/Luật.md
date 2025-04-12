---
share: true
created: 2024-09-06T16:43
updated: 2024-09-06T16:43
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```