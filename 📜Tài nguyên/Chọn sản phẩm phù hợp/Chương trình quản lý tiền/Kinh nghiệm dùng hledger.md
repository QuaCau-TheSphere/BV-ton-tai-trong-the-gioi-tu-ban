---
share: true
created: 2025-03-27T17:13
updated: 2025-10-06T15:13
---
[[Danh mục tài khoản|Danh mục tài khoản của Lý Minh Nhật]]

| Trường được dùng | Thông tin                       | Cách phân loại            |
| ---------------- | ------------------------------- | ------------------------- |
| Mô tả            | Tên cửa hàng \| Tên món hàng    |                           |
| Tài khoản        | Nơi lưu trữ tiền, Loại sản phẩm | Theo ngành nghề, sản phẩm |
| Tag              | Tên sự kiện                     | Theo nhu cầu              |
| Chú thích        |                                 |                           |

Giao dịch, sự kiện, thanh toán

- Một sự kiện có thể có nhiều giao dịch một món đồ, có thể trải dài nhiều ngày, nhiều tài khoản
- Một mục đích có thể có nhiều
- Giao dịch có thể có nhiều món hàng (đi chợ)

Transaction thì liệt kê từng món đồ cũng tiện. Nhưng vì posting là sự biến đổi của tài khoản, nên cũng không nên làm vậy 

LSP:
- Đổi alias ở tất cả mọi nơi 
- Đổi tên account ở tất cả mọi nơi 
- Khai báo account và alias mới ngay trong posting

Dùng alias trong posting thì sau này đổi danh mục cũng tiện, nhưng phải khai báo 2 lần ở account và alias. Lúc dùng app thì dễ dùng dạng đầy đủ hơn, đặc biệt là khi nó là mới

|                              | Dạng đầy đủ    | Alias        |
| ---------------------------- | -------------- | ------------ |
| CLI                          | ❌             | ✔            |
| Dùng trên app                | ✔              | ✔            |
| Dùng nhiều danh mục cùng lúc | ❌             | ✔            |
| Khai báo một lần             | ✔              | ❌           |
|                              | Nói nhóm chung | Nói món hàng |


include thì dùng app không gợi ý?

Tài khoản có thể được phân loại theo người sở hữu, nơi lưu tiền, mục đích sử dụng. Chỉ có thể assertion ở nơi lưu tiền

## Xem số tiền chuyển vào
```
hledger reg --related "" 
```