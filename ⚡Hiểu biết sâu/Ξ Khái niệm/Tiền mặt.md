---
share: true
created: 2025-04-11T18:42
updated: 2025-04-11T19:06
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```