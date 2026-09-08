#pragma once

#include <QObject>
#include <QSystemTrayIcon>
#include <QMenu>

class TrayManager : public QObject
{
    Q_OBJECT
public:
    explicit TrayManager(QObject *parent = nullptr);

    void show();
    void hide();
    void setToolTip(const QString &tip);

    Q_INVOKABLE void setAutoStart(bool enabled);
    Q_INVOKABLE bool isAutoStart() const;

signals:
    void showRequested();
    void hideRequested();
    void settingsRequested();
    void quitRequested();
    void screenshotRequested();

private slots:
    void onTrayActivated(QSystemTrayIcon::ActivationReason reason);

private:
    void createMenu();
    QSystemTrayIcon *m_tray;
    QMenu *m_menu;
};
