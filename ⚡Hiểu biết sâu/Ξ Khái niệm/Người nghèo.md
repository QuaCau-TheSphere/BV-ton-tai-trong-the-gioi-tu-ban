---
share: true
created: 2025-05-27T16:44
updated: 2025-05-27T16:44
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```