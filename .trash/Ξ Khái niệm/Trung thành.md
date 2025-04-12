---
share: true
created: 2024-10-30T22:49
updated: 2024-10-30T23:33
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```