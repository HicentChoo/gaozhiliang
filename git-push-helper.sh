#!/bin/bash
# Git 推送辅助脚本

echo "=========================================="
echo "Git 推送配置助手"
echo "=========================================="
echo ""

# 检查是否已有 token
if [ -z "$GITHUB_TOKEN" ]; then
    echo "请先创建 GitHub Personal Access Token："
    echo "1. 访问：https://github.com/settings/tokens"
    echo "2. 点击 'Generate new token' -> 'Generate new token (classic)'"
    echo "3. 勾选 'repo' 权限"
    echo "4. 生成并复制 Token"
    echo ""
    read -p "请输入您的 GitHub Token: " token
    export GITHUB_TOKEN=$token
fi

# 修改远程 URL 包含 token
echo ""
echo "正在配置 Git 远程地址..."
git remote set-url origin https://${GITHUB_TOKEN}@github.com/HicentChoo/gaozhiliang.git

echo ""
echo "正在推送代码..."
git push origin main

echo ""
echo "完成！"

