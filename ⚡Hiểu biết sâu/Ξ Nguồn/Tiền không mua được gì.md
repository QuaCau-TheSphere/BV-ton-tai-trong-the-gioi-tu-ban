---
share: true
updated: 2026-07-27T02:26
created: 2025-05-26T19:47
---
```dataview
LIST rows.file.link
FROM [[]] 
GROUP BY split(file.folder, "/")[0]
WHERE file.name != this.file.name
```
