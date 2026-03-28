---
created: 2025-03-21T22:15
updated: 2026-02-14T14:40
cssclasses:
  - wide-table
---
## Những tài khoản đã kiểm tra là đăng nhập được 
```dataview
TABLE ngân-hàng as "Ngân hàng", STK, sđt as "SĐT"
FROM "📜Tài nguyên/Tài nguyên chạy ảo/Tài khoản ngân hàng"
WHERE file.name != this.file.name 
WHERE đăng-nhập-được = "✔"
WHERE !contains(file.folder, "Thật" )
sort đăng-nhập-được desc
``` 
## Tất cả tài khoản
```dataview
TABLE ngân-hàng as "Ngân hàng", tên-đăng-nhập as "Tên đăng nhập" , mật-khẩu as "Mật khẩu", đăng-nhập-được as "Đăng nhập được", sđt as "SĐT", STK
FROM "📜Tài nguyên/Tài nguyên chạy ảo/Tài khoản ngân hàng"
WHERE file.name != this.file.name 
sort đăng-nhập-được desc
``` 


