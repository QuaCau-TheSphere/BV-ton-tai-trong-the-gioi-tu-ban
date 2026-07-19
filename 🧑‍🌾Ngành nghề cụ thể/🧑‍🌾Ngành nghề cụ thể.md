---
share: true
updated: 2026-07-17T14:08
created: 2026-03-28T21:02
---
```dataview
LIST rows.file.link
FROM "🧑‍🌾Ngành nghề cụ thể" 
GROUP BY split(file.folder, "/")[1]
WHERE file.name != this.file.name
```
