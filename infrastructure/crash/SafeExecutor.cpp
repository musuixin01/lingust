#include "SafeExecutor.h"
#include <QDebug>
#include <exception>

SafeExecutor* SafeExecutor::s_instance = nullptr;

SafeExecutor* SafeExecutor::instance()
{
    if (!s_instance) {
        s_instance = new SafeExecutor();
    }
    return s_instance;
}

SafeExecutor::SafeExecutor(QObject *parent)
    : QObject(parent)
{
}

bool SafeExecutor::safeInvoke(const QString &context, const std::function<void()> &func)
{
    try {
        func();
        return true;
    } catch (const std::exception &e) {
        QString error = QString::fromUtf8(e.what());
        qCritical() << "Exception in" << context << ":" << error;
        emit errorOccurred(context, error);
        return false;
    } catch (...) {
        qCritical() << "Unknown exception in" << context;
        emit errorOccurred(context, "Unknown exception");
        return false;
    }
}
