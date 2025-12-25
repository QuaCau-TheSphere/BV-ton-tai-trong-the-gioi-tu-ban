---
share: true
created: 2023-09-05T16:17
updated: 2025-12-19T11:32
---
Yêu cầu đầu vào:: [[Có thể dành thời gian nghiên cứu]]
```dataview
list without id split(file.folder, "/" )[3] + ": " + file.link
from "📜Tài nguyên/Chọn sản phẩm phù hợp/Chương trình quản lý tiền" 
where contains(file.outlinks,[[]])
where file.name != "Chương trình quản lý tiền" 
```
