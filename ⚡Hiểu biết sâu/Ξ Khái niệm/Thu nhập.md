---
share: true
created: 2024-09-06T13:34
updated: 2025-08-25T14:41
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
