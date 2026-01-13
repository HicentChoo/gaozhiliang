# 配置 Git 推送 - 详细步骤

## 📋 第一步：创建 GitHub Personal Access Token

### 步骤1：访问 GitHub Token 设置页面

1. 访问：https://github.com/settings/tokens
2. 或者：
   - 登录 GitHub
   - 点击右上角头像 -> **"Settings"**
   - 左侧菜单找到 **"Developer settings"**
   - 点击 **"Personal access tokens"** -> **"Tokens (classic)"**

### 步骤2：创建新 Token

1. 点击 **"Generate new token"** -> **"Generate new token (classic)"**
2. 填写信息：
   - **Note**（备注）：`Git推送认证`（或任何您喜欢的名字）
   - **Expiration**（过期时间）：选择 `90 days` 或 `No expiration`（根据您的需求）
   - **Select scopes**（权限范围）：至少勾选：
     - ✅ `repo`（完整仓库访问权限）
3. 滚动到底部，点击 **"Generate token"**

### 步骤3：复制 Token

⚠️ **重要**：Token 只会显示一次，请立即复制保存！

Token 格式类似：`ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## 🔧 第二步：配置 Git 使用 Token

有两种方式配置：

### 方式A：在推送时输入 Token（推荐，更安全）

当 Git 提示输入密码时，直接粘贴 Token 即可。

### 方式B：将 Token 保存到 Git 凭据存储

配置后，Git 会自动使用 Token，无需每次输入。

---

## 🚀 第三步：推送代码

配置完成后，运行推送命令即可。

