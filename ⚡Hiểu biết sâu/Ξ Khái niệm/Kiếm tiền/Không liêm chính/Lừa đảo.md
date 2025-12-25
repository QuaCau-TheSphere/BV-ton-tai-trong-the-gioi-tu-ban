---
share: true
created: 2025-04-09T00:11
updated: 2025-12-19T11:32
---
[[Cảnh giác lừa đảo]]
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
