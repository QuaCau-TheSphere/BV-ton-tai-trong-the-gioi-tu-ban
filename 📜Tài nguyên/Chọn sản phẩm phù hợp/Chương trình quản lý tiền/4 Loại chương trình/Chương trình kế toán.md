---
share: true
created: 2023-09-05T16:17
updated: 2025-12-19T11:32
cssclasses:
  - wide-table
---
Tên chương trình:: [[Misa]], [[Beancount, hledger]]
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

## Nguyên lý kế toán
Bật tốc độ x2 
https://www.youtube.com/playlist?list=PL_-45OdYyPILsLksRzmOLUMSeBSUwkAdY

## Chương trình kế toán chữ trơn
- [Plain Text Accounting](https://blog.emacsen.net/profit-first-constraints-plain-text-accounting.html "")
- [Plain Text Accounting (PTA) - plaintextaccounting.org](https://plaintextaccounting.org/ "Plain Text Accounting (PTA) - plaintextaccounting.org")

![&quot;Managing Your Finances Using Python&quot; - Brian Ryall - YouTube](https://www.youtube.com/watch?v=mFzctYkktXQ "&quot;Managing Your Finances Using Python&quot; - Brian Ryall - YouTube")
![Double Entry Bookkeeping for Personal Finance - YouTube](https://www.youtube.com/watch?v=lIGJzQw79hg "Double Entry Bookkeeping for Personal Finance - YouTube")
![Plain Text Accounting: An Opinionated View - YouTube](https://www.youtube.com/watch?v=ZDF7xVtKLu0 "Plain Text Accounting: An Opinionated View - YouTube")

