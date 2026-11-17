---
share: true
updated: 2026-11-17T16:04
---
<% tp.file.cursor() %>
```dataview
LIST
FROM "<% tp.file.folder(true) %>"
WHERE file.name != this.file.name
```
