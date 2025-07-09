---
share: true
cssClass: wide-table
created: 2024-08-02T17:39
updated: 2024-08-27T14:15
---
Tên chương trình:: [[Soulver]], [[figr]]

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

![Dynamic documents as personal software - Geoffrey Litt - YouTube](https://www.youtube.com/watch?v=bJ3i4K3hefI)
