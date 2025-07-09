---
share: true
created: 2025-04-29T15:21
updated: 2025-07-09T17:32
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
