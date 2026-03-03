# Garmin Developer 申请逐字段填写稿（最终提交版）

更新时间：2026-03-03  
申请入口（中国）：https://www.garmin.cn/zh-CN/forms/GarminConnectDeveloperAccess-China/

## 0. 提交前只改这 8 项

把下面 8 个占位符替换成你的真实信息后，可直接按本文提交：

- `{{LEGAL_NAME}}`：主体名称（个人可用你的工作室/项目主体名）
- `{{ADDRESS_EN}}`：地址（英文或拼音）
- `{{YOUR_NAME_EN}}`：你的英文名
- `{{YOUR_PHONE}}`：手机号
- `{{YOUR_EMAIL}}`：邮箱
- `{{PUBLIC_DOMAIN}}`：公网站点域名（例如 `xxxx.netlify.app`）
- `{{SERVER_REGION}}`：服务器区域（例如 `Netlify global CDN`）
- `{{CURRENT_USERS}}`：当前用户规模（例如 `Beta, <100 users`）

## 1. 字段逐项填写（可复制）

1. **App Name**
- `FitPilot`

2. **Company Name**
- `{{LEGAL_NAME}}`

3. **Company Address**
- `{{ADDRESS_EN}}`

4. **Country**
- `China`

5. **Your Name**
- `{{YOUR_NAME_EN}}`

6. **Job Title**
- `Founder`

7. **Phone Number**
- `{{YOUR_PHONE}}`

8. **Email**
- `{{YOUR_EMAIL}}`

9. **Company Website**
- `https://{{PUBLIC_DOMAIN}}`

10. **Brand image URL (300x300+)**
- `https://{{PUBLIC_DOMAIN}}/assets/logo.svg`

11. **Product overview**
```text
FitPilot is a web-based fitness assistant that helps users track daily health signals, workouts, and nutrition intake, then generates next-day training and meal recommendations. The service focuses on safe progression, recovery-aware planning, and long-term habit building.
```

12. **Current Number of Users**
- `{{CURRENT_USERS}}`

13. **Existing Platforms**
- `Web application (responsive), iOS/Android planned`

14. **Specific purposes for which you use Garmin data**
```text
We use Garmin health and activity data to provide users with personalized next-day workout and nutrition recommendations. Data points such as steps, heart rate, sleep, activity duration, and calories are used to estimate recovery state and training load. We do not sell user health data or use it for ad targeting.
```

15. **How do you plan to use the Developer Program**
```text
We plan to integrate Garmin Health API and Activity API via OAuth2-based cloud-to-cloud sync. After user authorization, FitPilot will ingest selected data, normalize metrics, and generate training and nutrition guidance in a user dashboard. Users can revoke access at any time.
```

16. **Which Garmin APIs do you need**
- 勾选：`Health API` + `Activity API`
- 说明：先不要申请过多 API，后续再加 `Training API`

17. **Is the data sold?**
- `No`

18. **Is data anonymous or associated with identifiable users?**
- `Associated with identifiable users`
- Reason:
```text
Needed for user-specific recommendations and history tracking.
```

19. **Server location**
- `{{SERVER_REGION}}`

20. **Data processing method**
```text
Data is received through authorized API access, transformed into normalized metrics, and processed by a recommendation engine. Access controls and encryption in transit are applied. Processing is limited to product functionality and support.
```

21. **Duration of data retention**
- `Active account period + 30 days after verified deletion request`

22. **Data storage location**
- `{{SERVER_REGION}}`

23. **Will data be shared with third parties?**
- `No`

24. **Planned customer/user profile**
```text
Fitness users aged 18+ who want personalized workout and nutrition planning.
```

25. **Redirect URI / Callback URL**（若表单有该字段）
- `https://{{PUBLIC_DOMAIN}}/api/garmin/callback`

26. **Privacy Policy URL**
- `https://{{PUBLIC_DOMAIN}}/privacy-policy.html`

27. **Terms URL**
- `https://{{PUBLIC_DOMAIN}}/terms.html`

28. **Data deletion URL**
- `https://{{PUBLIC_DOMAIN}}/data-deletion.html`

29. **Contact URL**（若有）
- `https://{{PUBLIC_DOMAIN}}/contact.html`

## 2. 补充说明（可粘贴）

### 中文版
```text
我们正在开发 FitPilot（Web 健身助手），目标是基于用户的日常健康数据和训练日志，提供次日训练与饮食建议，帮助用户在安全前提下长期坚持运动。Garmin 数据将仅用于用户授权后的个性化建议、训练负荷评估和恢复状态判断，不用于广告定向或数据售卖。我们提供明确的隐私政策、用户可撤回授权机制和数据删除流程，以确保数据使用合规透明。
```

### 英文版
```text
We are developing FitPilot, a web-based fitness assistant that provides next-day workout and nutrition recommendations based on users' daily health and training data. Garmin data will be used only after explicit user authorization for personalized guidance, recovery assessment, and training load management. We do not sell health data or use it for advertising. We provide a clear privacy policy, access revocation flow, and data deletion process to ensure compliant and transparent data handling.
```

## 3. 提交前最终核验

- [ ] `https://{{PUBLIC_DOMAIN}}` 可打开
- [ ] `https://{{PUBLIC_DOMAIN}}/privacy-policy.html` 可打开
- [ ] `https://{{PUBLIC_DOMAIN}}/data-deletion.html` 可打开
- [ ] `https://{{PUBLIC_DOMAIN}}/contact.html` 可打开
- [ ] 所有 `{{...}}` 已替换
- [ ] 电话和邮箱能收到 Garmin 邮件/来电

