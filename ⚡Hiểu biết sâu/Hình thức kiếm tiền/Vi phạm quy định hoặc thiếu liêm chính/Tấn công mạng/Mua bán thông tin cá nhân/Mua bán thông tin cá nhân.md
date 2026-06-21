---
share: true
created: 2025-03-27T17:13
updated: 2026-06-21T20:38
---
[Tiêu điểm: Thâm nhập đường dây mua bán thông tin cá nhân - Tin Tức VTV24 - YouTube](https://youtu.be/UxM7Aaxo2dc?si=pVY7joGPtzMmXw22)
![Following Your Stolen Data Through The Dark Web \| Incognito Mode \| WIRED - YouTube](https://youtu.be/izcWjajssRY?si=zYaBGIRmjy08Sz0H)

Data may be harvested from various sources, including census, change of address, motor vehicle-related records, user-contributed material and social networking sites, media and court reports, voter registration lists, consumer purchase histories, most-wanted lists and terrorist watch lists, bank card transaction records, health care authorities, and Web browsing histories. IBs may also purchase information from other companies (such as a credit card company). The information collected may include name, address, social security number, driver's licence number and other such identifying information, as well as occupation, property ownership, income, etc. Advertising companies are most often only interested in profiles and categories rather than personal information about an individual. 
[Data broker - Wikipedia](https://en.wikipedia.org/wiki/Data_broker)

```dataview
LIST rows.file.link
FROM "🛖Ngành nghề cụ thể/Khác/Mua bán thông tin cá nhân"
GROUP BY split(file.folder, "/")[3]
WHERE file.name != this.file.name
```