---
share: true
created: 2023-09-05T16:17
updated: 2026-09-21T23:01
cssclasses:
  - wide-table
description: Điểm giống và khác nhau giữa các chương trình kế toán
---
Tên chương trình:: [[Misa]], [[Beancount, hledger]]
Xem thêm:: [[🧑‍🌾Ngành nghề cụ thể/Tài chính/Kế toán/Kế toán|Kế toán]]
[Firefly III — A free and open source personal finance manager](https://www.firefly-iii.org/)
```dataview
table 
	filter(tính-năng, (i)=>contains(i.file.folder, "Cách nhập liệu")) as "Cách nhập liệu",
	filter(tính-năng, (i)=>contains(i.file.folder, "Cách phân loại")) as "Cách phân loại",
	filter(tính-năng, (i)=>contains(i.file.folder, "Chính sách giá")) as "Chính sách giá",
	filter(tính-năng, (i)=>contains(i.file.folder, "Giao diện")) as "Giao diện",
	filter(tính-năng, (i)=>contains(i.file.folder, "Khả năng tích hợp")) as "Khả năng tích hợp",
	filter(tính-năng, (i)=>contains(i.file.folder, "Số lượng trường phân loại")) as "Số lượng trường phân loại",
	filter(tính-năng, (i)=>contains(i.file.folder, "Khác")) as "Khác"
from outgoing([[]])
```

Tính năng:
```dataview
list 
from "📜Tài nguyên/Chọn sản phẩm phù hợp/Chương trình quản lý tiền" 
where contains(file.outlinks,[[]])
where file.name != "Chương trình quản lý tiền" 
```

## Chương trình kế toán định dạng đơn giản
### [Isn't plain text ugly and hard to use ?](https://hledger.org/faq.html#isnt-plain-text-ugly-and-hard-to-use-)
No way, it's great, honest. We love it. You'll love it. It's fast. It's cheap. It's non-distracting. It keeps you focussed on the content. It's copy-pasteable. It's accessible to screen readers. It's resizable. You can pick the font and colours. You do not need "Plaintext Reader, Trial Version" to read it. you do not need "Plaintext Studio Pro" to write it. You can use your favorite editor and skills you already have. You can search in it! You can version control it. It works well over remote/slow connections. It's future-proof. It will be just as usable in 15 or 50 years. You can still read it even without the right software or (if you print it) a working computer. _"Accounting data is valuable; we want to know that it will be accessible for ever - even without software. We want to know when it changes, and revision-control it. We want to search and manipulate it efficiently. So, we store it as human-readable plain text."_

- [Plain Text Accounting](https://blog.emacsen.net/profit-first-constraints-plain-text-accounting.html "")
- [Plain Text Accounting (PTA) - plaintextaccounting.org](https://plaintextaccounting.org/ "Plain Text Accounting (PTA) - plaintextaccounting.org")

![&quot;Managing Your Finances Using Python&quot; - Brian Ryall - YouTube](https://www.youtube.com/watch?v=mFzctYkktXQ "&quot;Managing Your Finances Using Python&quot; - Brian Ryall - YouTube")
![Double Entry Bookkeeping for Personal Finance - YouTube](https://www.youtube.com/watch?v=lIGJzQw79hg "Double Entry Bookkeeping for Personal Finance - YouTube")
![Plain Text Accounting: An Opinionated View - YouTube](https://www.youtube.com/watch?v=ZDF7xVtKLu0 "Plain Text Accounting: An Opinionated View - YouTube")

Demo:
- Đầu vào: ["Managing Your Finances Using Python" - Brian Ryall - YouTube](https://www.youtube.com/watch?v=mFzctYkktXQ)
- Đầu ra: [Income Statement - Example Beancount file](https://fava.pythonanywhere.com/example-beancount-file/income_statement/)

| Đặc điểm                                    | Lợi ích                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dùng được trên CLI                          | <li>[Cơ hội làm quen với terminal](https://lậptrình.quảcầu.cc/✍️Lập%20trình/Hệ%20điều%20hành,%20path%20và%20terminal/Terminal,%20shell,%20console/Terminal%20là%20cái%20chương%20trình%20để%20làm%20việc%20với%20shell?utm_source=Vault+C+Obsidian%2C+quản+lý+dự+án+và+công+cụ+nghĩ+(Trang+chủ)&utm_medium=Vault&utm_campaign=C2&utm_content=&utm_term=), công cụ giúp bạn bước vào cái lõi của hệ điều hành</li><li>Thấy được bản chất của việc đấu nối các phần mềm lại với nhau thế nào. Có thể minh hoạ việc này bằng việc kết hợp nó với Trấn Kỳ</li> |
| Dữ liệu chương trình lưu dưới dạng đơn giản | Hiểu được giá trị của việc lưu dữ liệu tại máy người dùng. Hiểu được việc dùng [Git](https://lậptrình.quảcầu.cc/📊Tổ%20chức%20dữ%20liệu.%20Phân%20tích%20dữ%20liệu/Tổ%20chức%20dữ%20liệu/Git/Git%20giúp%20ta%20du%20hành%20thời%20gian?utm_source=Vault+C+Obsidian%2C+quản+lý+dự+án+và+công+cụ+nghĩ+(Trang+chủ)&utm_medium=Vault&utm_campaign=C2&utm_content=&utm_term=)                                                                                                                                                                                   |
| Tạo lệnh truy vấn phức tạp được             | Tương tự SQL nên cũng giúp làm quen với SQL được                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Điều khiển hoàn toàn bằng bàn phím          | Giảm đau cổ tay do phải cầm chuột nhiều. Không rõ là dùng với AI thì có ổn không                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Là phần mềm tự do                           | Thấy được [[Khi nói đến mã nguồn mở, đa số chỉ để ý tới việc được đọc mã nguồn, chứ không để ý đến quyền được chỉnh sửa và phân phối nó\|các phần mềm mã nguồn đóng đã xiềng xích mình đến mức độ nào]]                                                                                                                                                                                                                                                                                                                                                    |
| Miễn phí                                    | Cắt giảm chi phí mua phần mềm                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Có sẵn trang báo cáo                        | Đỡ phải tạo trang báo cáo riêng                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

[[Kinh nghiệm dùng hledger]]