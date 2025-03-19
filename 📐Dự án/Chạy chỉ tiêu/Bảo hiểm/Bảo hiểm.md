---
share: true
created: 2024-10-30T15:02
updated: 2025-02-14T11:47
---
```dataview
LIST rows.file.link
FROM "📐Dự án/Chạy chỉ tiêu/Bảo hiểm"
WHERE file.name != this.file.name
Group by split(file.folder, "/" )[3]
```