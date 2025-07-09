---
share: true
created: 2025-03-27T17:13
updated: 2025-07-09T17:32
---
Phù hợp cho nhu cầu:: 
Đáp ứng yêu cầu:: 

Đáp ứng cho việc:
```dataview
list without id file.link + " (" + substring(split(file.folder, "/" )[3], 2) + ")" 
from "📜Tài nguyên/Chương trình quản lý tiền" 
where contains(file.outlinks,[[]])
where file.name != "Chương trình quản lý tiền" 
```
