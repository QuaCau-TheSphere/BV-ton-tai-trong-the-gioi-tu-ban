---
share: true
created: 2025-05-07T13:09
updated: 2025-05-07T13:09
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```