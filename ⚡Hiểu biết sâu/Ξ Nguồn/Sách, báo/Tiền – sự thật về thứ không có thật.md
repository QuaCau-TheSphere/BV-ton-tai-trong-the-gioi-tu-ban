---
share: true
updated: 2026-09-18T15:08
created: 2025-05-25T20:54
---
```dataview
LIST rows.file.link
where contains(nguồn, [[]])
GROUP BY split(file.folder, "/")[3]
```
