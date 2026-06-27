---
share: true
created: 2024-12-30T16:26
updated: 2026-06-27T17:12
---
Khái niệm:: 
Tốn thời gian nhất là cứ phải làm kyc, nhập thông tin địa chỉ thủ công. Đã nhập rồi nhưng vẫn cứ phải làm lại. Nếu không quá bất tiện thì có thể lên trực tiếp công ty luôn để thử xem việc khai báo có đỡ nhức đầu hơn không.

![[Pasted image 20241230162607.png]]
![[Pasted image 20241230162703.png]]
![[Pasted image 20241230163248.png]]
![[Pasted image 20241230163809.png]]

[[Nếu khách hàng không rõ ngay từ đầu thì sao còn ký. Nếu đã ký thì là biết rõ rồi]]
[[FE có vốn điều lệ hơn 10 ngàn tỷ đồng. Xếp hàng thứ 2 là Easy Credit với 3 ngàn tỷ]]

[[Dữ liệu cá nhân phản ánh hoạt động, lịch sử hoạt động trên mạng là dữ liệu cá nhân cơ bản chứ không phải là nhạy cảm]]
[[Khoản vay của tổ chức tài chính tiêu dùng|Cách làm việc của nhân viên thu hồi nợ]]

```dataview
LIST rows.file.link
FROM "🧑‍🌾Ngành nghề cụ thể/Tài chính/Tổ chức tín dụng/Chính sách công ty/Công ty tài chính tiêu dùng" 
GROUP BY split(file.folder, "/")[5]
WHERE file.name != this.file.name
```