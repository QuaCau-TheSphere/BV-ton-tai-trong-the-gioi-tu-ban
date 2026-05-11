---
share: true
created: 2025-03-27T17:13
updated: 2026-04-03T13:58
---
```dataview
LIST rows.file.link
where contains(nguồn, [[]])
GROUP BY split(file.folder, "/")[3]
```