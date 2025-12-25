---
share: true
created: 2024-11-12T14:33
updated: 2025-12-19T11:32
---
```dataview
LIST rows.file.link
FROM "📜Tài nguyên/Quà tặng"
GROUP BY split(file.folder, "/")[2]
WHERE file.name != this.file.name
```
- Đến các buổi liên hoan phim, giới thiệu phim
