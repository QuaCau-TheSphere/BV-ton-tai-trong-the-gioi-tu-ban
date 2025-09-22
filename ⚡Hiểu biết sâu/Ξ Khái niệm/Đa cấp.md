---
share: true
created: 2025-05-13T14:58
updated: 2025-09-20T16:48
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
