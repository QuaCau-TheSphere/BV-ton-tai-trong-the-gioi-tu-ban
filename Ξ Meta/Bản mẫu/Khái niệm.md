---
share: true
updated: 2026-11-17T16:07
---
<% tp.file.cursor() %>

```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[0]
```
