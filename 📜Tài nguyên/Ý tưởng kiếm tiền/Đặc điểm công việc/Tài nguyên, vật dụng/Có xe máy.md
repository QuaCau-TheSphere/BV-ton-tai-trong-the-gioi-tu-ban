---
share: true
updated: 2026-07-27T02:26
created: 2026-07-14T19:44
---
```dataview
LIST rows.file.link
FROM [[]]
GROUP BY split(file.folder, "/")[3]
WHERE file.name != this.file.name
```
