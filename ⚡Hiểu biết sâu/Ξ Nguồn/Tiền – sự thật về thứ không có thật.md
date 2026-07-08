---
share: true
updated: 2026-07-07T12:59
created: 2025-05-25T20:54
---
```dataview
LIST rows.file.link
where contains(nguồn, [[]])
GROUP BY split(file.folder, "/")[3]
```
