#pragma once

#include <QObject>
#include <memory>

class QQmlApplicationEngine;
class AppState;
class TranslatorWindow;
class TrayManager;
class HotkeyManager;
class MouseHookManager;

class Application : public QObject
{
    Q_OBJECT
public:
    explicit Application(QObject *parent = nullptr);
    ~Application() override;

    int run();

private:
    std::unique_ptr<QQmlApplicationEngine> m_engine;
    std::unique_ptr<AppState> m_appState;
    std::unique_ptr<TranslatorWindow> m_window;
    std::unique_ptr<TrayManager> m_tray;
    std::unique_ptr<HotkeyManager> m_hotkey;
    std::unique_ptr<MouseHookManager> m_mouseHook;
};
