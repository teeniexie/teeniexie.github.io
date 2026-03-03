# FitPilot Web（小白发布版）

你现在有一套可直接上线的静态网站，用于 Garmin 申请材料。

## 文件说明

- `index.html`：产品首页
- `tracker.html`：健身 Agent 体验页
- `privacy-policy.html`：隐私政策
- `terms.html`：服务条款
- `data-deletion.html`：数据删除说明
- `contact.html`：联系页
- `assets/logo.svg`：品牌图
- `garmin-application-field-draft.md`：Garmin 逐字段最终提交稿

## 最简单发布公网（推荐：Netlify 拖拽法）

这个方法不需要写命令，也不需要先学 Git。

1. 打开 https://app.netlify.com/drop 。
2. 按提示注册/登录 Netlify（可用 GitHub 账号）。
3. 在电脑中打开 `fitness-agent-web` 文件夹所在目录。  
4. 把整个 `fitness-agent-web` 文件夹拖到 Netlify 页面中间的上传区域。  
5. 等待 10-60 秒，看到 `Site deploy complete`。  
6. 你会拿到一个公网地址，例如：`https://abc-fitpilot.netlify.app`。  

## 发布后立刻检查这 5 个链接

把下面的 `{{你的域名}}` 替换成你拿到的 Netlify 域名：

- `https://{{你的域名}}/`
- `https://{{你的域名}}/privacy-policy.html`
- `https://{{你的域名}}/terms.html`
- `https://{{你的域名}}/data-deletion.html`
- `https://{{你的域名}}/contact.html`

都能打开就可以去填 Garmin 申请表。

## 想把网址改得更好看（可选）

1. 在 Netlify 控制台进入你的站点。
2. 打开 `Site configuration`。
3. 进入 `Domain management`。
4. 点击 `Options` -> `Edit site name`。
5. 改成你想要的唯一名字，如 `fitpilot-health-beta`。

## Garmin 提交前你必须改的内容

1. 打开 `garmin-application-field-draft.md`。  
2. 替换 8 个占位符：  
- `{{LEGAL_NAME}}`
- `{{ADDRESS_EN}}`
- `{{YOUR_NAME_EN}}`
- `{{YOUR_PHONE}}`
- `{{YOUR_EMAIL}}`
- `{{PUBLIC_DOMAIN}}`
- `{{SERVER_REGION}}`
- `{{CURRENT_USERS}}`
3. 复制每个字段内容到 Garmin 表单提交。

## 备用发布方法（Vercel）

若你后续要长期维护，建议用 Vercel + GitHub：

1. 先把 `fitness-agent-web` 上传到 GitHub 仓库。  
2. 登录 https://vercel.com/ -> `Add New Project`。  
3. 选择该仓库导入。  
4. Framework 选 `Other`，Build Command 留空。  
5. 点击 Deploy，完成后获得 `https://xxx.vercel.app`。

## 本地打开

直接双击 `index.html` 即可。

