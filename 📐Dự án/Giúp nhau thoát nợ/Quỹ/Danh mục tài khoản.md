---
share: true
created: 2025-03-27T17:13
updated: 2025-10-06T15:10
title: Danh mục tài khoản của quỹ
cssClasses: wide-table
aliases:
  - Lý Minh Nhật
  - Xây dựng ontology
---
Nhật là người nắm giữ tiền và trực tiếp chi tiêu cho các nhu cầu của Nhật. Một trong các nhu cầu đó là giúp mọi người và lập quỹ chung. Các giao dịch có sự có mặt của Nhật sẽ phải được xem dưới góc độ nào đây?
- **Chi phí cho cuộc sống của Nhật là của Nhật**: Phân biệt thu nhập, chi tiêu cho mọi người. 
- **Chi phí cho cuộc sống của Nhật là một phần chi phí của mạng lưới các cá nhân**: Tất cả các nơi lưu tiền của mọi người đều được xem là tài sản. Chỉ là sự chuyển tiền giữa các tài khoản với nhau, dù đó là giữa nhiều người. Bán hàng thì cũng thế
- **Chi phí cho cuộc sống của Nhật là một phần chi phí của quỹ**: Chỉ những người mình xem là trong quỹ thì mới là tài sản


mặt khác vẫn muốn giữ đúng nguyên tắc

| Loại tài khoản                                               | Ví dụ               | Khi xét mình là sở hữu | Khi xét là quỹ | Khi xét là một phần cộng đồng |
| ------------------------------------------------------------ | ------------------- | ---------------------- | -------------- | ----------------------------- |
| Đồ Nhật đang sử dụng                                         | Laptop, điện thoại  | Tài sản                | Tài sản        | Tài sản                       |
| Chi tiêu cá nhân Nhật                                        | Vé xe, Hội thảo     | Chi phí                | Chi phí        | Chi phí                       |
| Chi tiêu cho mọi người                                       | Vé xe               | Chi phí                | Chi phí        | Chi phí                       |
| Tài khoản Nhật và dùng cá nhân                               |                     | Tài sản                | Tài sản        | Tài sản                       |
| Tài khoản Nhật và dùng cho quỹ                               | vcb, vietin         | Tài sản                | Tài sản        | Tài sản                       |
| Tiền mẹ cho                                                  |                     | Doanh thu              | Doanh thu      | Tài sản                       |
| Tài khoản người khác đứng tên và cho Nhật mượn               | Hương, Quân         | Nợ                     | Nợ             | Tài sản                       |
| Tài khoản người khác đứng tên và Nhật cho mượn               | Trí, Thịnh          | Tài sản                |                | Tài sản                       |
| Tiền được trả cho Nhật cho những thứ phát sinh khi Nhật giúp | Lộc                 | Doanh thu              |                | Tài sản                       |
| Tiền Nhật trả cho những thứ phát sinh khi Nhật giúp          | Phí đáo thẻ seabank | Chi phí                | Chi phí               | Chi phí                       |
| Cà phê thảo luận                                             |                     | Chi phí                | Chi phí        | Chi phí                       |
| Chuyển tiền giùm                                             |                     |                        |                |                               |

Phí đáo thẻ seabank nên vào mục giúp thịnh hay vào mục seabank? Nếu là vào seabank thì nó vẫn ko phải là phí chính thức của ngân hàng, nên không nên để tiền ngân hàng vào nhóm chung?


sườn, be, cơm chả cá có khai báo không?
Lúc thì tên doanh nghiệp là tên tài khoản (Vietinbank), lúc thì không (be) 

Nếu xem Nhật giúp quỹ, thì Nhật âm tiền, quỹ dương. Nếu xem Nhật với quỹ là một, thì việc ghi nhận là Nhật chuyển tiền vào gây hiểu nhầm
[[Số âm hay dương có ý nghĩa khác nhau tuỳ vào góc nhìn chuyển tiền hay người thực hiện giao dịch]]. Hơn nữa mọi người cũng không có cách nghĩ như vậy



## Ý nghĩa bảng cân đối cho dự án [[Ngân hàng mini và mạng lưới cho vay ngang hàng|Giúp nhau thoát nợ]]
[[Âm hay dương trong giao dịch là tiền ra hay tiền vào. Âm dương trong cân đối là tiền nợ hay tiền có]]. [[Số âm hay dương có ý nghĩa khác nhau tuỳ vào góc nhìn chuyển tiền hay người thực hiện giao dịch]]

### Mô hình 1: Có ghi chuyển qua người mượn nợ
Ưu điểm: thấy hiển nhiên
Nhược điểm: phải làm thêm thao tác khi nhập liệu. Nếu người vay dùng nơi lưu tiền để xử lý việc khác thì khó, nên cần tạo thêm một tài khoản chỉ cho việc nợ với người vay

```mermaid
flowchart LR
a1["Nơi lưu tiền của người cho vay"] --> b["Tài khoản giúp người vay"]--> c["Nơi lưu tiền của người vay" ]-->b
a2["Thẻ tín dụng" ] -->b
```

|                                | Âm                               | 0                          | Dương                                      |
| ------------------------------ | -------------------------------- | -------------------------- | ------------------------------------------ |
| Tài khoản giúp người vay       | Mình tính sai                    | Phải luôn bằng 0           | Còn khoản chưa chuyển                      |
| Nơi lưu tiền của người vay     | Mình tính sai                    | Người vay đã trả nợ đầy đủ | ☹️Người vay còn đang nợ mình               |
| Nơi lưu tiền của người cho vay | ☹️Mình đang còn nợ người cho vay | Mình đã trả nợ đầy đủ      | Mình trả thừa                              |
| Thẻ tín dụng                   | ☹️Đang nợ ngân hàng              | Không có nợ                | Ngân hàng hoàn tiền khi mình đang không nợ |


### Mô hình 2: Không ghi chuyển qua người mượn nợ
Ưu điểm: Làm giảm một đoạn nhập liệu

```mermaid
flowchart LR
c["Nơi lưu tiền của người vay" ]-->b["Tài khoản giúp người vay"]
```

|                            | Âm            | 0                          | Dương                 |
| -------------------------- | ------------- | -------------------------- | --------------------- |
| Tài khoản giúp người vay   | Mình tính sai | Người vay đã trả nợ đầy đủ | ☹️Họ còn đang nợ mình |
| Nơi lưu tiền của người vay | Mình tính sai | Họ đã trả nợ đầy đủ        | Tài sản của họ        |

---

|                    | Dương                                                         | Âm                                                            |
| ------------------ | ------------------------------------------------------------- | ------------------------------------------------------------- |
| `Quỹ:Quả Cầu:Giúp` | Mình tăng nợ với người cho mượn. Người mượn đang tăng nợ mình | Mình giảm nợ với người cho mượn. Người mượn đang giảm nợ mình |
| Thẻ tín dụng       |                                                               |                                                               |

|                 | Dương              | Âm                      |
| --------------- | ------------------ | ----------------------- |
| `Cá nhân:[Tên]` | Người mượn giảm nợ | Người mượn đang tăng nợ |
| Thẻ tín dụng    |                    |                         |

[[Kinh nghiệm dùng hledger]]

| Ví dụ                      | Mô tả                      | Tài khoản                                | Tag                                      | Chú thích |
| -------------------------- | -------------------------- | ---------------------------------------- | ---------------------------------------- | --------- |
| đồ ăn mẹ                   | Coopmart                   | Đồ ăn                                    | Giúp:Mẹ                                  |           |
| sách Ruột ơi là ruột       | Nhã Nam \| Ruột ơi là ruột | Chi phí:Giáo dục, văn hoá, giải trí:Sách | Kiến-thức,-giao-lưu:Truyện tranh kế toán |           |
| Bắt grab lên nhà dì ăn giỗ | Grab \| Từ nhà lên nhà dì  | Chi phí:Đi lại:Dịch vụ:Grab              | Kiến-thức,-giao-lưu:Giỗ                  |           |

## Tag
- Kiến-thức,-giao-lưu
- Giúp:[Tên cá nhân]

## Tài khoản
### Chi phí
- Giao thông
	- Xăng/Gửi xe/Metro
	- Xe buýt:Vé lượt/Vé tập
- Y tế:Bảo hiểm y tế/Tạm ứng/Hoàn trả/Xét nghiệm/Thuốc/Dụng cụ y tế
- Giáo dục, văn hoá, giải trí: Hội thảo/Khoá học/Phim/Sách/Cà phê trò chuyện
- Tài chính: Bảo hiểm xã hội/Đáo, rút
- Khác:Vệ sinh công cộng

Khi đi chợ thì hay chia ra thịt, cá, tinh bột
Ăn sáng, ăn trưa, cũng có thể là cơm quán
Chợ, siêu thị thì thường là thực phẩm, nhưng cũng có thể là đồ gia dụng
Không trong ăn chính thì có thể là ăn xế, ăn vặt
### Tài sản
- Tiền mặt:Bóp 1/Bóp 2
- Tài khoản thanh toán:[Tên ngân hàng]

### Cộng đồng
- Cá nhân:[Tên cá nhân]:Tiền mặt/Chuyển khoản/[Tên ngân hàng]
- Quỹ:[Tên tổ chức]:
	- Tài khoản thanh toán/Thẻ tín dụng/Ví trả sau
	- Giúp:[Tên cá nhân]


### Thu nhập
Hiểu theo nghĩa là người ta phải có trách nhiệm đưa tiền cho mình, không phải từ sự tương hỗ