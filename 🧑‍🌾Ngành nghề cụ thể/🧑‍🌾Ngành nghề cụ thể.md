---
share: true
updated: 2026-10-08T22:20
created: 2026-03-28T21:02
---
[Góc Khuất Ngành Nghề \| Facebook](https://www.facebook.com/groups/1496027005474744/?__mmr=1&_rdr)
[Industry classification - Wikipedia](https://en.wikipedia.org/wiki/Industry_classification)
```dataview
LIST rows.file.link
FROM "🧑‍🌾Ngành nghề cụ thể" 
GROUP BY split(file.folder, "/")[2]
WHERE file.name != this.file.name
```
