遵循 [Semantic Versioning 2.0.0](http://semver.org/lang/zh-CN/) 语义化版本规范。

#### 发布周期

- 修订版本号：bugfix
- 次版本号：新功能
- 主版本号：新特性

icon说明：
🏆 里程碑
🐞 fix
🌟 亮点
💄 主题色
🚮 移除
🆕 新增
🛠 属性、api
⚡️  提升性能
🔨 重构
🔧 修改配置文件

---
## 0.6.0
- 坐标网格渲染
- 行列伸缩
  -  鼠标移动到行列表头时，当前行or列高亮
  -  mousemove时，有辅助线跟随
  -  行列伸缩的附加影响：当前行列面积改变、命中的选中框面积改变
- 滚动
  - 滚动的触发：鼠标向下拖动滚动条、鼠标滚轮mousewheel
  - 表头索引栏固定不动
  - 表格内容滚动
  - 命中的单元格跟随滚动
- 选中框
  - 单击单元实现单元格选中
  - 单击单元格，并mousemove，实现单元格多选
  - 鼠标上下左右键，实现单元格移动
  - 滚动时候，命中的选中框实现跟随滚动
- 单元格文字渲染处理(换行、溢出)
  - 文字不超出单元格宽高
  - 行列伸缩时，文字要重绘，以适应单元格大小
- 编辑框
  - 双击单元格进入编辑状态，该单元格可输入文字
- viewdata
  - 所有与表格实际意义有关的数据抽象在viewdata里，改变方法也在viewdata里