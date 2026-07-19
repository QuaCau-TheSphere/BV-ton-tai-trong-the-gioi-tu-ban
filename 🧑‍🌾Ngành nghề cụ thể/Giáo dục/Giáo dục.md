---
share: true
updated: 2026-07-11T15:14
created: 2026-07-11T15:09
---
```dataview
LIST rows.file.link
FROM "🧑‍🌾Ngành nghề cụ thể/Giáo dục"
GROUP BY split(file.folder, "/")[2]
WHERE file.name != this.file.name
```