---
share: true
created: 2024-10-30T15:07
updated: 2024-10-30T15:07
---
```dataview
LIST rows.file.link
FROM "📜Tài nguyên/Chính sách công ty/Bảo hiểm"
WHERE file.name != this.file.name
Group by split(file.folder, "/" )[3]
```
