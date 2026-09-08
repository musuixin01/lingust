#pragma once

#include <QObject>
#include <QString>
#include <functional>
#include <QVariant>

class SafeExecutor : public QObject
{
    Q_OBJECT
public:
    static SafeExecutor* instance();

    // 安全执行函数，捕获所有异常
    template<typename Func>
    static auto safeCall(Func func, const char *context = "unknown") -> decltype(func())
    {
        try {
            return func();
        } catch (const std::exception &e) {
            qCritical() << "Exception in" << context << ":" << e.what();
            return decltype(func())();
        } catch (...) {
            qCritical() << "Unknown exception in" << context;
            return decltype(func())();
        }
    }

    // 安全执行 void 函数
    template<typename Func>
    static void safeCallVoid(Func func, const char *context = "unknown")
    {
        try {
            func();
        } catch (const std::exception &e) {
            qCritical() << "Exception in" << context << ":" << e.what();
        } catch (...) {
            qCritical() << "Unknown exception in" << context;
        }
    }

    Q_INVOKABLE bool safeInvoke(const QString &context, const std::function<void()> &func);

signals:
    void errorOccurred(const QString &context, const QString &error);

private:
    explicit SafeExecutor(QObject *parent = nullptr);
    static SafeExecutor *s_instance;
};
