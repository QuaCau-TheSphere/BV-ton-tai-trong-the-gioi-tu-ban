---
share: true
created: 2024-07-17T21:41
updated: 2024-08-05T16:48
---
## Vì người yếu thế
|                             | Số tiền rút lần đầu | Lãi | Thời hạn | Điều kiện                                                      |
| --------------------------- | ------------------- | --- | -------- | -------------------------------------------------------------- |
| [[Quỹ Tình Thân]]           | 2tr                 |     |          | Trưởng nhóm bảo lãnh                                           |
| [[CEP]]                     |                     |     |          | Là thành viên công đoàn hoặc có xác nhận cư trú của địa phương |
| Ngân hàng chính sách xã hội |                     |     |          |                                                                |

## Ví trả sau
|           | Số tiền rút lần đầu | Điều kiện |
| --------- | ------------------- | --------- |
| Momo      | 3tr                 |           |
| ZaloPay   |                     |           |
| Shopee    |                     |           |
| ShopeePay |                     |           |
| Lazada    |                     |           |

## App cho vay
|             | Số tiền rút lần đầu | Lãi | Thời hạn |
| ----------- | ------------------- | --- | -------- |
| Fundiin     |                     |     |          |
| Tnex        |                     |     |          |
| Kredivo     |                     |     |          |
| EasyCredit  |                     |     |          |
| Mcredit     |                     |     |          |
| Cake        |                     |     |          |
| HDSaison    |                     |     |          |
| Home Credit |                     |     |          |
| FE Credit            |                     |     |          |

- Khi bị app từ chối duyệt thì phải đợi mấy tháng mới cho nộp lại
- Viettel Money chỉ là cái app để chuyển sang các app cho vay khác. [[Rất nhiều các công ty cho vay lấy dữ liệu từ Viettel]]
- Vay dưới 10tr dễ được duyệt hơn
- Home Credit bắt phải có 2 giấy tờ bổ sung
- Tnex ko đổi đc sđt 

[[Bên cho vay lãi quá rẻ thực ra là để mình chịu làm kyc để người khác tạo tài khoản ảo bằng tên của mình]]

## Ngân hàng
|      | Số tiền rút lần đầu | Lãi | Thời hạn | Điều kiện |
| ---- | ------------------- | --- | -------- | --------- |
| CIMB |                     |     |          |           |
Ngân hàng CIMB tạo thẻ tín dụng hạn mức 100tr, chỉ cần trả 3tr∕tháng trong mấy năm hay gì đó là đc
[[Ngân hàng chỉ cần đất, sổ tiết kiệm hoặc ô tô, chứ mấy cái nhỏ sẽ từ chối]]
[[Ghi chú về các app ngân hàng]]
[[Thẻ tín dụng và ví trả sau đều là các hình thức cấp tín dụng]]

## App cho vay nóng
|              | Số tiền rút lần đầu | Lãi | Thời hạn |
| ------------ | ------------------- | --- | -------- |
| [[Moneyveo]] | 1tr5                |     | 10 ngày  |
| Cayvang      | 1tr5                |     | 10 ngày  |
| Moneycat     |                     |     |          |

Jeff chỉ là cái app để chuyển sang các app cho vay khác
Vay nóng nếu không trả

## Tiệm cầm đồ
F88 giống tiệm cầm đồ, dùng cà vẹt xe để vay

Thông tin khác:
```dataview
LIST 
FROM "📜Tài nguyên/Vay tiền" 
WHERE file.name!=this.file.name
```

## ⚡Hiểu biết sâu
```dataview
LIST rows.file.link
FROM "⚡Hiểu biết sâu/Vay tiền" 
WHERE file.name!=this.file.name
group by split(file.folder, "/")[2] 
```

## Nơi thảo luận
![](https://i.imgur.com/OtW4epu.png)
