# 提交 PR 到 awesome-dsh-plugin 的避坑指南

> 总结自 ph4310822/dsh-edex-ui 投稿 PR 的实战经验

---

## 核心问题：screenshots 投稿方式已变更

**旧做法**（已废弃）：把截图 URL 写到上游仓库的 `data/screenshots.json` 里。

**新做法**：在你自己的插件仓库里声明 `screenshots.json`，路径相对于该文件本身，指向你仓库里已有的图片。

```json
// <你的仓库>/screenshots.json
[
  "assets/screenshot-1.png",
  "assets/screenshot-2.png"
]
```

`{"screenshots": [...]}` 或以条目 URL 为 key 的写法也都接受。

### 对 monorepo 的处理

如果你的插件是 monorepo 里的一个子包（比如 `packages/bundle`），`screenshots.json` 放在对应子目录，即和该子包的 `package.json` 同一层：

```
<你的仓库>/
├── packages/
│   └── bundle/
│       ├── package.json
│       ├── screenshots.json     ← 放这里
│       └── assets/
│           ├── screenshot-1.png  ← 图片路径相对于 screenshots.json
│           └── screenshot-2.png
├── package.json
└── ...
```

### 新做法的好处

| 维度 | 旧做法 | 新做法 |
|------|--------|--------|
| 改截图 | 重新提 PR，等合并 | 推自己的仓库，下次构建自动生效 |
| 图片改名 | 绝对 URL 悄悄烂掉（773 张已发布截图里 41 张已是 404） | 在你自己仓库里立刻能看出来 |
| 冲突 | 所有投稿编辑同一文件，必然冲突 | 没有别人动你这个文件，永不冲突 |
| 维护者 | 108 个 PR 同时改这个文件，合哪个都让其他 107 个 rebase | 无需处理 |

---

## 如果你提交 PR 后遇到 data/screenshots.json 冲突

### 场景 1：你的 PR 里已经不小心加了 data/screenshots.json

```bash
# 1. 拉取上游最新代码
git fetch upstream

# 2. 变基到上游 main
git rebase upstream/main

# 3. 放弃你的 screenshots 改动，取上游版本
#    （注意：不要用 --ours / --theirs，rebase 里它们的含义和 merge 相反）
git checkout upstream/main -- data/screenshots.json

# 4. 暂存，继续变基
git add data/screenshots.json
git rebase --continue

# 5. 强制推送更新 PR
git push --force-with-lease

# 6. 将 screenshots.json 声明推到你自己的插件仓库
#    到你插件仓库目录下：
git add screenshots.json
git commit -m "Declare screenshots in screenshots.json"
git push origin main
```

### 场景 2：你的 PR 还没有提交，但已知以后会放截图

直接跳过 `data/screenshots.json`，只在自己的插件仓库里放 `screenshots.json`。PR 的 diff 里永远不要包含 `data/screenshots.json` 的改动。

---

## 如果 README 也报冲突

README 和 README.zh.md 冲突时，**不要手动编辑**——用脚本重新生成：

```bash
# 取上游的 README 为基础
git checkout upstream/main -- README.md README.zh.md

# 重新生成（包含当前分支里你新增的插件条目）
node scripts/generate-readme.mjs

# 继续变基
git add README.md README.zh.md
git rebase --continue
```

---

## Git 操作注意事项

### 1. 始终用 `git checkout upstream/main -- <文件>` 而不是 `--ours` / `--theirs`

在 `rebase` 过程中：
- `--ours` 实际上是**变基过来的新提交**（你的代码）
- `--theirs` 实际上是**上游 main**（他们的代码）

这和 `merge` 的含义完全相反，非常容易搞错。搞反了就会把别人的截图整段删掉。所以永远写明分支名。

### 2. 用 `--force-with-lease` 而不是 `--force`

```bash
# ✅ 安全：如果远程分支被别人推了新内容，会拒绝推送
git push --force-with-lease

# ❌ 危险：无条件覆盖远程分支，可能覆盖别人的工作
git push --force
```

### 3. 推送顺序

1. 先推送 PR 分支到 fork（更新 GitHub 上的 PR）
2. 再推送 `screenshots.json` 到自己的插件仓库

两者互不影响，可以独立进行。

---

## 快速检查清单

提交 PR 前检查：

- [ ] `data/screenshots.json` 没有出现在 `git diff upstream/main...HEAD` 中
- [ ] 自己的插件仓库已经有 `screenshots.json`（与 `package.json` 同级）
- [ ] `screenshots.json` 中的路径是相对路径，指向仓库内的图片
- [ ] 图片文件确实存在（`git ls-files` 能看到）
- [ ] 图片有对应的 raw.githubusercontent.com URL 返回 200（可选验证）
- [ ] 如果合并了最近的 upstream main，README 是否已重新生成

---

## 引用

- [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) — 上游仓库
- [contributing.md](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/blob/main/contributing.md) — 官方投稿指南