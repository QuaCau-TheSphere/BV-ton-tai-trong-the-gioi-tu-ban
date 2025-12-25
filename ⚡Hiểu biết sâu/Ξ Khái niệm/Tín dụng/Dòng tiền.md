---
share: true
created: 2024-09-30T12:08
updated: 2025-12-19T11:32
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY file.folder
```
GROUP BY split(file.folder, "/")[3]
