---
share: true
updated: 2026-07-07T12:59
created: 2025-05-28T14:10
---
Khái niệm:: 
```dataview
LIST rows.file.link
FROM "📐Dự án/Chạy chỉ tiêu/Chơi chính sách/Tài liệu về từng công ty"
GROUP BY split(file.folder, "/")[4]
WHERE file.name != this.file.name
```

1. IP, mac, imei, tên điện thoại
2. SĐT quá giống định dạng
3. Thời gian đăng nhập, đặt hàng, đăng xuất trùng nhau
4. Vượt VPN tìm được IP chính để nhận ra tất cả đều trùng 1 IP
5. Người quét QR đặt đơn mua hàng trùng nhau

[[Chính sách với tài khoản ảo]]
