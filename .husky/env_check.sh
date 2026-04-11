#!/usr/bin/env sh

# 1. 目标版本配置
TARGET_VERSION=23
CURRENT_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)

# 2. 版本检查与自动切换逻辑
if [ "$CURRENT_VERSION" -lt "$TARGET_VERSION" ]; then
    echo "⚠️ 当前 Node 版本 v$CURRENT_VERSION 过低，尝试提升至 v$TARGET_VERSION..."

    if command -v fnm >/dev/null 2>&1; then
        echo "检测到 fnm，正在同步环境..."
        eval "$(fnm env)"
        fnm use $TARGET_VERSION >/dev/null 2>&1 || fnm install $TARGET_VERSION
        fnm use $TARGET_VERSION
    elif [ -s "$NVM_DIR/nvm.sh" ] || [ -s "$HOME/.nvm/nvm.sh" ]; then
        echo "检测到 nvm，正在加载环境..."
        [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
        [ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh"
        nvm use $TARGET_VERSION >/dev/null 2>&1 || nvm install $TARGET_VERSION
        nvm use $TARGET_VERSION
    else
        echo "❌ 错误: 未检测到 fnm 或 nvm，且当前版本低于 v$TARGET_VERSION。"
        echo "请手动将 Node.js 升级至 v$TARGET_VERSION 或更高版本，否则无法提交。"
        exit 1
    fi
fi

# 3. 确认切换后的 Node 版本
FINAL_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$FINAL_VERSION" -lt "$TARGET_VERSION" ]; then
    echo "❌ 切换失败: 最终 Node 版本 v$FINAL_VERSION 仍不符合要求。"
    exit 1
fi

# 4. --- 自动安装 pnpm (非强制) ---
if ! command -v pnpm >/dev/null 2>&1; then
    echo "📦 未检测到 pnpm，正在尝试自动安装..."
    # 使用 || true 确保即便 npm 报错，脚本也不会退出
    npm install -g pnpm --loglevel error || echo "⚠️ pnpm 自动安装失败。继续提交流程，但建议手动安装 pnpm 以获得更好体验。"
fi

# 确保脚本以成功状态结束，进入 pre-commit 的 lint 环节
return 0 2>/dev/null || exit 0
