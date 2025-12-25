---
share: true
created: 2025-04-25T21:45
updated: 2025-12-19T11:32
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
