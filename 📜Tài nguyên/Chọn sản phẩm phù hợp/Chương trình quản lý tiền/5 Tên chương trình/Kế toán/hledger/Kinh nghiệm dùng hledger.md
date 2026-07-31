---
share: true
updated: 2026-07-27T02:26
created: 2025-10-06T15:13
---
[[Danh mục tài khoản và ý nghĩa bảng cân đối của quỹ]]

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

[[Tài khoản có thể được phân loại theo người sở hữu, nơi lưu tiền, mục đích sử dụng]]. Chỉ có thể assertion ở nơi lưu tiền

Thu nhập là số âm. Nếu xem tài khoản đó là thứ mình quan tâm thì chỉ là sự chuyển đổi giữa các tài khoản. Nên không để kiểu là R được. Nhưng để như vậy thì có mấy lệnh sẽ tiện

## Xem số tiền chuyển vào
```
hledger reg --related "" 
```

```
2025-09-24
  expenses:primary:category  1    ; secondary:foo:bar, tertiary:baz:qux
  assets

$ hledger bal -N -t --no-elide expenses
                   1  expenses
                   1    primary
                   1      category
$ hledger bal -N -t --no-elide expenses --pivot secondary
                   1  foo
                   1    bar
$ hledger bal -N -t --no-elide expenses --pivot tertiary
                   1  baz
                   1    qux

```

## Thêm tài khoản chưa khai báo
```
hledger accounts --directive --undeclared >> $env:LEDGER_FILE
```
[hledger workflow 2025 - Joyful Systems](https://joyful.com/hledger+workflow+2025)

[[areg dùng để đối chiếu tài khoản thật, còn reg là để kiểm tra thu chi]]

[What are some gotchas with piping hledger print into another hledger command?](https://hledger.org/faq.html#what-are-some-gotchas-with-piping-hledger-print-into-another-hledger-command-)

my wallet has multiple commodities, and is opened with this transaction:
```
2025-06-01 | Bắt đầu Thịnh
    A:TKTT                  -4000
    A:TKTT                   -2040
    A:TKTT                   -500
    Nơi lưu tiền:Tiền mặt:Bóp Nhật      -0.5 chỉ
    (Giúp:Thịnh)                        -6540
    (Giúp:Thịnh)                        -0.5 chỉ  
    A                        6540
    A:Tiền mặt               0.5 chỉ
```
hledger areg bóp not:cur:chỉ not:cur:usd
. When I want to select 
