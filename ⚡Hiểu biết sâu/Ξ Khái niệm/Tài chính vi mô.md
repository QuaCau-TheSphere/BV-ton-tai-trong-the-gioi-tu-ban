---
share: true
created: 2025-04-13T21:37
updated: 2025-04-15T16:22
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[2]
```