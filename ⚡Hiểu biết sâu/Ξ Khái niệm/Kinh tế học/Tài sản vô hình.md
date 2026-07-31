---
share: true
updated: 2026-07-27T02:26
created: 2025-08-17T16:18
---
```dataview
LIST rows.file.link
from [[]]
GROUP BY split(file.folder, "/")[3]
```
