---
share: true
created: 2025-03-27T17:13
updated: 2025-08-31T11:39
---
Khái niệm:: 
[DIỄN ĐÀN NGÂN HÀNG](https://www.facebook.com/groups/gocnhinnganhang/)
```dataview
LIST rows.file.link
FROM "📜Tài nguyên/Tình hình ở Việt Nam/Lĩnh vực cụ thể/Tổ chức tín dụng/Ngân hàng"
GROUP BY split(file.folder, "/")[5]
WHERE file.name != this.file.name
```
Nguồn:: 
