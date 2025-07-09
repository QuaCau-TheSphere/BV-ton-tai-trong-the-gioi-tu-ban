---
share: true
created: 2024-10-30T15:02
updated: 2025-06-02T13:22
---
```dataview
LIST rows.file.link
FROM "📐Dự án/Chạy chỉ tiêu/Làm nhân sự thật/Bảo hiểm"
WHERE file.name != this.file.name
Group by split(file.folder, "/" )[4]
```
