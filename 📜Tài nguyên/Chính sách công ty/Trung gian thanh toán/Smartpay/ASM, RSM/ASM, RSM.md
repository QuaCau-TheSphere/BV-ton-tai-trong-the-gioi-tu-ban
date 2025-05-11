---
share: true
created: 2023-09-05T16:17
updated: 2025-05-06T01:31
---
ASM là viết tắt của *area sale manager*, nghĩa là *quản lý bán hàng khu vực*.
RSM là viết tắt của *regional sale manager*, nghĩa là *giám đốc kinh doanh vùng*.
[[Thuật ngữ, viết tắt]]
```dataviewjs
const đdGhiChúThưMục = dv.current().file.path
const thưMụcHiệnTại = dv.current().file.folder
const dsTấtCảGhiChúĐượcLấy = dv.pages(`"${thưMụcHiệnTại}"`).file.link
const kếtQuả = dsTấtCảGhiChúĐượcLấy.filter(i=>i.path !== đdGhiChúThưMục)
dv.list(kếtQuả)
```