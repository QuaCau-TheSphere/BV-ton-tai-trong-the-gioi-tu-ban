---
share: true
created: 2024-09-30T12:16
updated: 2024-09-30T12:16
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```