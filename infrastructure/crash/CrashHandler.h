#pragma once

#include <QObject>
#include <QString>
#include <QDateTime>

class CrashHandler : public QObject
{
    Q_OBJECT
public:
    static CrashHandler* instance();

    void init();
    bool didCrashLastRun() const { return m_didCrash; }
    QString lastCrashInfo() const { return m_lastCrashInfo; }
    void clearCrashFlag();

    static void messageHandler(QtMsgType type, const QMessageLogContext &context, const QString &msg);

signals:
    void crashDetected(const QString &info);

private:
    explicit CrashHandler(QObject *parent = nullptr);
    ~CrashHandler() override;

    void writeCrashLog(const QString &reason);
    QString crashFlagPath() const;
    QString crashLogPath() const;

    bool m_didCrash;
    QString m_lastCrashInfo;

    static CrashHandler *s_instance;
};
