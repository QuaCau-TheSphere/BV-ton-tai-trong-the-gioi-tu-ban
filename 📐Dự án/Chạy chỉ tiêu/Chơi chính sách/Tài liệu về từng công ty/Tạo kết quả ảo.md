---
share: true
created: 2025-03-27T17:13
updated: 2025-06-02T13:21
---
Khái niệm:: 
```dataview
LIST rows.file.link
FROM "📐Dự án/Chạy chỉ tiêu/Làm nhân sự thật/Tạo khách hàng ảo"
GROUP BY split(file.folder, "/")[4]
WHERE file.name != this.file.name
```