---
share: true
created: 2023-09-05T16:17
updated: 2025-09-12T13:48
---
Phù hợp cho nhu cầu:: 

Đáp ứng cho việc:
```dataview
list without id file.link + " (" + substring(split(file.folder, "/" )[3], 2) + ")" 
from "📜Tài nguyên/Chọn sản phẩm phù hợp/Chương trình quản lý tiền" 
where contains(file.outlinks,[[]])
where file.name != "Chương trình quản lý tiền" 
```
