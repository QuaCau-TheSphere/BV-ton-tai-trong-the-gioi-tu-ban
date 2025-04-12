---
share: true
created: 2025-03-22T21:46
updated: 2025-04-05T15:36
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```