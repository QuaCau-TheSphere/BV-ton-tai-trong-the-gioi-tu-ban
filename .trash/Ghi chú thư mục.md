---
share: true

updated: 2026-06-05T14:48
---
```dataviewjs
const đdGhiChúThưMục = dv.current().file.path
const thưMụcHiệnTại = dv.current().file.folder
const dsTấtCảGhiChúĐượcLấy = dv.pages(`"${thưMụcHiệnTại}"`).file.link
const kếtQuả = dsTấtCảGhiChúĐượcLấy.filter(i=>i.path !== đdGhiChúThưMục)
dv.list(kếtQuả)
```
