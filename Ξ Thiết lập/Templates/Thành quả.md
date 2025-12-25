---
share: true
created: 2025-03-27T17:13
updated: 2025-12-19T11:32
---
%%
#file/thành-quả
%%
Trạng thái:: <% (await tp.system.suggester((item) => item, Object.keys(app.metadataCache.getTags()).filter((key) => key.includes('tt')).filter((key) => key.includes('/')))) %>
Độ cấp thiết:: <% (await tp.system.suggester((item) => item, Object.keys(app.metadataCache.getTags()).filter((key) => key.includes('đct')))) %>

Phục vụ cho thành quả:
```dataview
List 
From #file/thành-quả 
where contains(thành-quả-cần-có,[[]]) or contains(thành-quả-hỗ-trợ,[[]]) 
```

Là giải pháp cho vấn đề:
```dataview
List 
where contains(giải-pháp-gợi-ý,[[]]) 
```

Thành quả cần có:: 

Thành phẩm::
