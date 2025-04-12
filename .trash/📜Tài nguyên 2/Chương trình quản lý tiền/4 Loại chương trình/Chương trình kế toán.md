---
share: true
created: 2023-09-05T16:17
updated: 2024-08-27T14:15
cssClass: wide-table
---
Tên chương trình:: [[Misa]], [[Beancount]]

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
from "📜Tài nguyên/Chương trình quản lý tiền" 
where contains(file.outlinks,[[]])
where file.name != "Chương trình quản lý tiền" 
```

## Nguyên lý kế toán
Bật tốc độ x2 
https://www.youtube.com/playlist?list=PL_-45OdYyPILsLksRzmOLUMSeBSUwkAdY

## Chương trình kế toán văn bản thuần
- [Plain Text Accounting](https://blog.emacsen.net/profit-first-constraints-plain-text-accounting.html "")
- [Plain Text Accounting (PTA) - plaintextaccounting.org](https://plaintextaccounting.org/ "Plain Text Accounting (PTA) - plaintextaccounting.org")

![&quot;Managing Your Finances Using Python&quot; - Brian Ryall - YouTube](https://www.youtube.com/watch?v=mFzctYkktXQ "&quot;Managing Your Finances Using Python&quot; - Brian Ryall - YouTube")
![Double Entry Bookkeeping for Personal Finance - YouTube](https://www.youtube.com/watch?v=lIGJzQw79hg "Double Entry Bookkeeping for Personal Finance - YouTube")
![Plain Text Accounting: An Opinionated View - YouTube](https://www.youtube.com/watch?v=ZDF7xVtKLu0 "Plain Text Accounting: An Opinionated View - YouTube")

Vì phần chi tiêu cá nhân ko có tác dụng đối với mục đích kê khai thuế ở Mỹ, nên m nói mục đích của dev beancount có vẻ ko phải để theo dõi chi tiêu. b đọc các ví dụ minh họa cách sử dụng của beancount sẽ thấy đa phần là để theo dõi danh mục đầu tư cá nhân, ghi nhận lãi lỗ, nhằm mục đích kê khai thuế thu nhập cá nhân hàng năm của Mỹ. Không như Vietnam thì thuế thu nhập từ đầu tư cá nhân đã được thu hộ tại nguồn là các cty chứng khoán rồi Nhưng m thấy beancount vẫn làm tốt việc theo dõi chi tiêu ở mức tiểu khoản rất tốt. Nếu kiên nhẫn nhập đúng và đủ.

