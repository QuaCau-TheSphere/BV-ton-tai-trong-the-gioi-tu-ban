---
share: true
created: 2023-09-05T16:17
updated: 2025-06-16T20:30
---
## Mô tả chung
- **Nhu cầu:** thử nghiệm thị trường cho [[Chương trình quản lý chi tiêu cá nhân từ Trấn Kỳ]]
- **Giải pháp:** tạo webapp 

Sau khi xong sẽ marketing, để cho người dùng dùng thử. Huy sẽ thử với cộng đồng của mình trước. Nếu có phản hồi tốt sẽ mở ra các gói dùng thử.

## Yêu cầu
### Yêu cầu chức năng
- ❓Ghi chép cần tổng hợp được
- Cho dùng thử không cần login
- Login cho người dùng trả phí
- ❓Biểu đồ flow ko gãy

### Yêu cầu giao diện 

### Yêu cầu phi chức năng
- Refactor API trên server
- Thời gian khởi động dưới 5s

## Thời gian hoàn thành và giá
```mermaid
gantt
dateFormat  D/M H:m
axisFormat  %d/%m
title       Biểu đồ mẫu

section Phần chính
Refactor API trên server    : 8/1 9:00, 3d
Ghi chép cần tổng hợp được  : 5d 
Biểu đồ                     : 3d

section Phần cho khách mua
Trang login                 : 5d 
Trang bán hàng              : 3d
```
Thời gian hoàn thành dự kiến (giả sử ngày làm 10 tiếng): 
- Cho từng chức năng (bottom-up): 1 tuần nếu chưa có sẵn kiến thức về chức năng đó, 2 ngày nếu đã có sẵn kiến thức
- Cho toàn bộ dự án (top-down): 20 ngày

> [!Tip] Hiểu biết sâu
> - [Định luật 90-90: 90% lượng code ban đầu tốn 90% thời gian lập trình. 10% lượng code còn lại tốn thêm 90% thời gian lập trình]() 
> - [Định luật Hofstadter: Mọi thứ sẽ luôn tốn thời gian hơn bạn nghĩ, kể cả khi bạn đã tính đến định luật Hofstadter]()
> - [Hãy nhắm còn đủ tiền cho khoảng 20 đến 30 lần thất bại]()
 
## Cách thức trao đổi nhu cầu
Đáp ứng được các mục tiêu của [[📐Dự án/Tự động hoá/Trấn Kỳ/Cũ/4 Thành phẩm/Đội ngũ/Nhật]], [[📐Dự án/Giúp nhau thoát nợ/Khách hàng/Kendy/Kendy cần gì|Trí]] và [[Thịnh]]. Nếu không thì giá để Nhật làm là 200k/giờ hoặc $1000/tháng.

Xem thêm:: [[Lý do viết Trấn Kỳ]]

## Nền tảng cần dùng
- **Máy chủ:** Deno Deploy
- **Cơ sở dữ liệu:** Deno KV
- **Ngôn ngữ:** TypeScript
- **Runtime:** Deno
- **Framework:** Fresh
- **UI:** DaisyUI, Tailwind 

Ngôn ngữ TypeScript với runtime Deno là thích hợp nhất cho những app còn nhỏ

Nếu viết app điện thoại thì có thể dùng framework Capacitor để có thể viết một lần mà có cả app Android và iOS, nhưng như vậy thì có thể sẽ phải đổi runtime sang Node. 

## Thời hạn bảo hành phần mềm
Tuỳ vào loại vấn đề mà sẽ xem xét nó có phải là lỗi hay không. Nếu nó không phải là yêu cầu đã được thống nhất trước mà là tính năng mới thì tính phí theo giờ như bình thường.
- Nếu lúc còn ít người dùng thì app không có vấn đề gì mà đến lúc người dùng tăng cao thì có vấn đề thì sẽ xét là một tính năng