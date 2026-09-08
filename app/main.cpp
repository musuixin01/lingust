#include <QApplication>
#include <QQuickWindow>
#include <QSGRendererInterface>
#include <QSurfaceFormat>
#include <QDebug>
#include <cstdio>
#include "Application.h"
#include "../infrastructure/crash/CrashHandler.h"

int main(int argc, char *argv[])
{
    // 最早期初始化崩溃处理器
    CrashHandler::instance()->init();

    // 必须在创建 QApplication 之前设置表面格式，启用 alpha 通道
    QSurfaceFormat format;
    format.setAlphaBufferSize(8);
    format.setSamples(4);
    QSurfaceFormat::setDefaultFormat(format);

    QApplication app(argc, argv);

    // per-pixel alpha 实现圆角（已验证圆角正常）
    QQuickWindow::setDefaultAlphaBuffer(true);

    QApplication::setApplicationName("Linguist");
    QApplication::setOrganizationName("Linguist");
    QApplication::setApplicationDisplayName("Linguist 桌面悬浮翻译");
    QApplication::setQuitOnLastWindowClosed(false);

    Application application;
    int result = application.run();

    // 正常退出，清除崩溃标记
    CrashHandler::instance()->clearCrashFlag();

    return result;
}
