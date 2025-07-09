---
share: true
created: 2025-04-11T21:26
updated: 2025-07-09T17:32
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
