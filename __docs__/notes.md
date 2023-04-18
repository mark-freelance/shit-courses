## finished todos

- [x] 修复了"天球坐标"模块没有习题的问题，原因是数据库 `db.super-modules` 中记录的"天文模块"的 `module_name` 与 `db.questions` 中条目的 `question_type` 不一致，直接修改 `module_name` 即可（多了两个字`内容`），但这样也影响到了UI上的显示，因为是直接绑定的。其实最好的办法是修改一下索引设计，链接时使用 `_id` 而不要用 `question_type` ！
