#include "TrayManager.h"
#include <QApplication>
#include <QSettings>
#include <QCoreApplication>
#include <QFileInfo>
#include <QPixmap>
#include <QPainter>
#include <QIcon>
#include <QAction>

#ifdef Q_OS_WIN
#include <windows.h>
#endif

TrayManager::TrayManager(QObject *parent)
    : QObject(parent)
    , m_tray(new QSystemTrayIcon(this))
    , m_menu(new QMenu())
{
    createMenu();

    // 创建简单的托盘图标（用文字生成的图标）
    QPixmap pixmap(32, 32);
    pixmap.fill(Qt::transparent);
    QPainter painter(&pixmap);
    painter.setRenderHint(QPainter::Antialiasing);
    painter.setBrush(QColor("#3b82f6"));
    painter.setPen(Qt::NoPen);
    painter.drawRoundedRect(2, 2, 28, 28, 8, 8);
    painter.setPen(Qt::white);
    QFont font = painter.font();
    font.setBold(true);
    font.setPointSize(12);
    painter.setFont(font);
    painter.drawText(pixmap.rect(), Qt::AlignCenter, "L");
    painter.end();

    m_tray->setIcon(QIcon(pixmap));
    m_tray->setToolTip("Lingust 悬浮翻译");
    m_tray->setContextMenu(m_menu);

    connect(m_tray, &QSystemTrayIcon::activated, this, &TrayManager::onTrayActivated);
}

void TrayManager::createMenu()
{
    QAction *showAction = m_menu->addAction("显示主窗口");
    connect(showAction, &QAction::triggered, this, &TrayManager::showRequested);

    QAction *screenshotAction = m_menu->addAction("截图翻译");
    connect(screenshotAction, &QAction::triggered, this, &TrayManager::screenshotRequested);

    QAction *settingsAction = m_menu->addAction("设置");
    connect(settingsAction, &QAction::triggered, this, &TrayManager::settingsRequested);

    m_menu->addSeparator();

    QAction *quitAction = m_menu->addAction("退出");
    connect(quitAction, &QAction::triggered, this, &TrayManager::quitRequested);
}

void TrayManager::show()
{
    m_tray->show();
}

void TrayManager::hide()
{
    m_tray->hide();
}

void TrayManager::setToolTip(const QString &tip)
{
    m_tray->setToolTip(tip);
}

void TrayManager::onTrayActivated(QSystemTrayIcon::ActivationReason reason)
{
    if (reason == QSystemTrayIcon::Trigger) {
        emit showRequested();
    } else if (reason == QSystemTrayIcon::DoubleClick) {
        emit showRequested();
    }
}

void TrayManager::setAutoStart(bool enabled)
{
#ifdef Q_OS_WIN
    QSettings settings("HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Run",
                       QSettings::NativeFormat);
    QString appPath = QCoreApplication::applicationFilePath();
    QString appName = "Lingust";

    if (enabled) {
        settings.setValue(appName, QString("\"%1\"").arg(appPath));
    } else {
        settings.remove(appName);
    }
#endif
}

bool TrayManager::isAutoStart() const
{
#ifdef Q_OS_WIN
    QSettings settings("HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Run",
                       QSettings::NativeFormat);
    return settings.contains("Lingust");
#else
    return false;
#endif
}
