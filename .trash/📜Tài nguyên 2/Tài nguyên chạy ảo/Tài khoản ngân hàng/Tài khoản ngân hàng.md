---
created: 2025-03-21T22:15
updated: 2025-03-25T22:00
cssClass: wide-table
---
0522 569 585
## Những tài khoản đã kiểm tra là đăng nhập được 
```dataview
TABLE ngân-hàng as "Ngân hàng", STK, sđt as "SĐT"
FROM "📜Tài nguyên/Tài nguyên chạy ảo/Tài khoản ngân hàng"
WHERE file.name != this.file.name 
WHERE đăng-nhập-được = "✔"
sort đăng-nhập-được desc
``` 
## Danh sách tất cả tài khoản
```dataview
TABLE ngân-hàng as "Ngân hàng", tên-đăng-nhập as "Tên đăng nhập" , mật-khẩu as "Mật khẩu", đăng-nhập-được as "Đăng nhập được", sđt as "SĐT", STK
FROM "📜Tài nguyên/Tài nguyên chạy ảo/Tài khoản ngân hàng"
WHERE file.name != this.file.name 
sort đăng-nhập-được desc
``` 

