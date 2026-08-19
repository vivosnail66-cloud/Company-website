# DEVELOPMENT_LOG — Header 全新重写

日期:2026-08-13
项目:gotocosmic-cms v3 (Next.js 15 + Payload CMS 3)

## 根因 / 背景

旧 Header 是 Payload 模板自带结构:variant(standard/centered/minimal)+ 悬空引用 `navigation-menus` 集合(该 collection 从未注册,菜单永远为空)+ 无语言切换/CTA/通知栏。用户决定全新重写,删除历史组件,按「布局变体 × Nav 变体」双层解耦规范重建。

## 改动清单

### 删除(连根)
- `src/Header/` 旧实现(Component / Nav / config / getHeader / hooks / RowLabel)
- `src/payload.config.ts` globals 中 Header 注册(后重建)
- layout.tsx / SettingsHub 旧引用
- **保留** `src/providers/HeaderTheme`(页面/hero 依赖其控制 header 配色,非 Header 专属)

### 新建
- `src/fields/lucideIcon.ts` — 共用字段库:lucide 图标预设下拉(85 项,营销人员下拉选)
- `src/fields/headerActions.ts` — 共用字段库:语言切换开关 + **动态 action 数组**(label/url/appearance=link|button,留空不渲染)
- `src/Header/config.ts` — Header global,四 tab:
  - Layout:`variant`(logo-left / menu-left)+ `sticky`(默认开)
  - Navigation:`variant`(6 种 mega 布局,全局一份)+ **`items[]` 顶级菜单项**(label + link 可选 + `mega` 组可选:columns/image/promo;带 mega 的项点开是 Mega Menu,纯链接项直接跳转)
  - Announcement:`enabled` + `dismissible` + `items[]`(每条 text/label/link/enabled,localized)
  - Actions:headerActions 共用字段组(语言开关 + 动态 action 列表)
- `src/Header/getHeader.ts` — 解析统一结构(depth=1 取媒体 URL)
- `src/Header/hooks/revalidateHeader.ts` — 缓存失效(global_header tag)
- 前端组件:`Component.tsx`(server)/ `Component.client.tsx`(variant 排列 + 主题联动 + 汉堡)/ `Nav/index.tsx`(6 variant 渲染 + click 展开 + 完整 a11y)/ `Nav/iconMap.tsx` / `AnnouncementBar/index.tsx`(多条堆叠 + sessionStorage 关闭)/ `Actions/index.tsx`(地球下拉切换 locale)/ `MobileDrawer/index.tsx`(手风琴 + CTA)
- `tests/int/header-icons.int.spec.ts` — admin 下拉与前端 iconMap 同步检查

### 扩展
- `SiteSettings/config.ts` + `brand.ts` + `getSiteSettings.ts` — `mobileLogo`(移动版 logo,缺省回退桌面)
- `Logo` 组件 — `size` prop(desktop 34px / mobile 28px)
- `payload.config.ts` / `layout.tsx` / `SettingsHub` — 重新注册/挂载/恢复链接
- `payload generate:types` — 重新生成 payload-types.ts
- `endpoints/seed/index.ts` — 移除 `navigation-menus` 悬空引用;header 种子数据改为新结构

## 临时开关

- 通知栏:`admin → Settings → Header → Announcement` tab,`enabled` 勾选后填 items
- Header variant / Nav variant:同页 Layout / Navigation tab 下拉切换
- sticky:Layout tab checkbox(默认开)

## 验证方式

```bash
npx tsc --noEmit        # src/ 零错误(仅 node_modules 既有噪音)
npx vitest run          # 9 tests 全过(含 icon 同步检查)
```

未跑:浏览器实际渲染验证(dev server 由用户终端启动)、payload 数据库迁移(新增 global 字段,重启自动)。

## 遗留 / 后续

- Nav 内容(栏目清单/promo 图)待营销后台填充;seed 只写了最小示例列
- 后续多语言:locale.ts 加语言即可,语言下拉 UI 自动列出
- 桌面 mega menu 展开为 click(与 6 种参考风格一致);若后续要 hover 模式,改 `Nav/index.tsx` toggle 逻辑即可
- `headerActions` 字段目前是 label+url 简单结构;若 CTA 需要 internal reference 链接,升级为 `optionalLink()` 工厂

---

# DEVELOPMENT_LOG — 云端生产编译打包流程

日期:2026-08-19
项目:gotocosmic-cms v3 (Next.js + Payload CMS)

## 根因 / 背景

项目需要在 GitHub Actions 云端完成 Next.js + Payload CMS 编译打包,并验证 Docker 镜像构建。原 workflow 使用 npm,但项目实际是 pnpm;Dockerfile 依赖 `.next/standalone`,但 Next 未启用 standalone 输出;Payload 前台页面在 build 阶段枚举内容路由会查询数据库内容表,CI 临时库没有生产内容;Docker deps 阶段没有复制 `pnpm-workspace.yaml`,导致 pnpm 10 不读取 native dependency build allowlist。

## 改动清单

- `next.config.ts` — 启用 `output: 'standalone'`。
- `Dockerfile` — 改为 pnpm 多阶段构建,复制 `pnpm-workspace.yaml`,生成 Payload import map/types,复制 `.next/standalone` 与 `.next/static` 到运行镜像。
- `.dockerignore` — 排除 `.env`、`.next`、`node_modules`、本地媒体、生成 sitemap 和构建缓存。
- `.github/workflows/payload-build.yml` — 配置 PostgreSQL 16 service、pnpm/Node 22.17.0、import map/types/typecheck/Next build/Docker build 全流程。
- `src/Header/config.ts` + `src/Header/RowLabel.tsx` — 修复 Payload admin row label 类型和缺失组件,解除类型检查阻塞。
- `src/app/(frontend)/**` 内容页 — 对 Payload 内容查询路径使用运行时动态渲染;CI/Docker build 通过 `SKIP_PAYLOAD_STATIC_PARAMS=true` 跳过静态参数枚举。
- `src/payload.config.ts` — 增加 `PAYLOAD_DATABASE_PUSH` 临时开关,仅供 CI/一次性构建库使用;生产不依赖它。
- `PRODUCTION_WORKFLOW.md` — 新增生产工作流程文档。
- `README.md` — 增加生产流程文档入口。

## 临时开关

- `SKIP_PAYLOAD_STATIC_PARAMS=true`:CI/Docker build 专用,避免构建期查询 Payload 内容表;运行时不需要设置。
- `PAYLOAD_DATABASE_PUSH=true`:CI 临时库专用,生产禁用,生产 schema 变更走 migrations。

## 验证方式

```bash
pnpm generate:importmap
pnpm generate:types
pnpm exec tsc --noEmit
pnpm run build
```

云端验证:

```txt
Commit: d77592c8d32a732bbefb2658ffa67276f32badf7
Workflow: Payload CMS Build
Run: https://github.com/vivosnail66-cloud/Company-website/actions/runs/32232225516
Result: success
```

通过步骤包含 `Build Next.js and Payload CMS` 与 `Build Docker image`。

## 遗留 / 后续

- 生产上线前必须配置真实 `DATABASE_URL`、`PAYLOAD_SECRET`、`CRON_SECRET`、`PREVIEW_SECRET`、`NEXT_PUBLIC_SERVER_URL`。
- 生产 schema 变更必须生成并执行 Payload migrations,不要用 `PAYLOAD_DATABASE_PUSH` 替代。
- 若要推送镜像到 registry,在 workflow 的 `docker/build-push-action` 中增加登录和 `push: true`。
