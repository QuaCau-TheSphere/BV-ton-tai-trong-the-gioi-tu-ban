---
share: true
updated: 2026-07-07T12:59
created: 2025-05-20T16:27
---
```dataview
LIST rows.file.link
FROM "📜Tài nguyên/Chọn sản phẩm phù hợp"
GROUP BY split(file.folder, "/")[2]
WHERE file.name != this.file.name
```
