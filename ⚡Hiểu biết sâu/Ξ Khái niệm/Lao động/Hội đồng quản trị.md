---
share: true
updated: 2026-07-07T12:58
created: 2026-06-07T15:40
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
