单文件测评页，作者愿召。题目、类型、文案均为原创，交互形态与 cati 那类单页测评一致。

线上地址：<https://yuanzhao-y.github.io/heart-coordinate/>

## 文件

| 路径 | 说明 |
| --- | --- |
| `index.html` | 全部内容在这一个文件里：样式、42 道题、计分、雷达图、九种类型、分享 |
| `CNAME.sample` | 想绑自定义域名时，改好域名后重命名为 `CNAME` 再推送 |
| `tools/check_scoring.js` | 计分与类型判定的回归检查，`node tools/check_scoring.js` |
| `verify/` | 封面、结果页、类型图鉴的渲染截图 |

## 本地查看

直接双击 `index.html`。需要起服务时：

```
python -m http.server 8770 --directory .
```

然后打开 `http://127.0.0.1:8770/`。类型图鉴可以直接用 `/#gallery` 打开。

## 部署

仓库 `yuanzhao-y/heart-coordinate`，Pages 走 `main` 分支根目录，每次推送后自动构建。构建状态：

```
gh api repos/yuanzhao-y/heart-coordinate/pages/builds/latest --jq '.status'
```

## 自定义域名

`liangqiaosen.com` 目前在公共 DNS 里查不到记录（NXDOMAIN），先确认域名已注册、并把 NS 指到实际使用的解析服务。

解析可用之后：

1. 把 `CNAME.sample` 改成 `CNAME`，内容为完整子域名。
2. 在 DNS 加一条 `CNAME` 记录，主机记录填子域名前缀，记录值 `yuanzhao-y.github.io`。
3. 仓库 Settings → Pages 里填入同一个域名并开启 HTTPS。

分享链接取的是 `location.origin + location.pathname`，换域名后不用改代码。

## 改内容的位置

都在 `index.html` 的 `<script>` 里：

- `QUESTIONS`：42 条，每条 `{dim, text, opts[5], reverse?}`，`dim` 取 `sensory / touch / pleasure / belonging / resonance / values`。百分制分母写死在 `scores()` 的 `28` 上（7 题满幅），改题量时一并改。
- `TYPES`：九种类型的 `name / tag / cond / copy[3] / advice`，结果页与图鉴页共用。
- `classify()`：判定顺序，命中即停。
- `shareBtn`：分享文案与链接。

## 已验证

- 42 题，六个维度各 7 题；每题 5 个选项；反向题 3 道（第 11、23、29 题）。
- 计分与九种类型判定跑过 20000 组随机作答，全部落在九种类型内，没有落空的分支。
- 全选第一项得到待观察型；全选末项得到灵魂伴侣型；前三段末项、后三段首项得到致命吸引型；后三段末项得到家人归属型。
- 封面、答题、结果页、类型图鉴在 560×1000 与桌面宽度下渲染正常，雷达图按六维取值绘制。
- 页面不发起任何外部请求，无第三方统计。

## 说明

本测评用于自我觉察与关系沟通，非心理诊断。结果反映作答当下的感受，会随关系阶段变化。