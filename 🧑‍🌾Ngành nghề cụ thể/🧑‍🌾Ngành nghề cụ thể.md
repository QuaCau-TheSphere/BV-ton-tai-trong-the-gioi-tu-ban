---
share: true
updated: 2026-07-27T02:21
created: 2026-03-28T21:02
---
[Góc Khuất Ngành Nghề \| Facebook](https://www.facebook.com/groups/1496027005474744/?__mmr=1&_rdr)
```dataview
LIST rows.file.link
FROM "🧑‍🌾Ngành nghề cụ thể" 
GROUP BY split(file.folder, "/")[1]
WHERE file.name != this.file.name
```
