#include "CrashHandler.h"
#include <QCoreApplication>
#include <QDir>
#include <QFile>
#include <QTextStream>
#include <QDateTime>
#include <QDebug>
#include <QStandardPaths>
#include <exception>
#include <cstdlib>

CrashHandler* CrashHandler::s_instance = nullptr;

CrashHandler* CrashHandler::instance()
{
    if (!s_instance) {
        s_instance = new CrashHandler();
    }
    return s_instance;
}

CrashHandler::CrashHandler(QObject *parent)
    : QObject(parent)
    , m_didCrash(false)
{
}

CrashHandler::~CrashHandler()
{
    clearCrashFlag();
}

void CrashHandler::init()
{
    // 检查上次是否崩溃
    QFile flagFile(crashFlagPath());
    if (flagFile.exists()) {
        m_didCrash = true;
        if (flagFile.open(QIODevice::ReadOnly | QIODevice::Text)) {
            m_lastCrashInfo = QString::fromUtf8(flagFile.readAll());
            flagFile.close();
        }
        qWarning() << "Previous run crashed:" << m_lastCrashInfo;
        emit crashDetected(m_lastCrashInfo);
    }

    // 创建崩溃标记文件（正常退出时删除）
    if (flagFile.open(QIODevice::WriteOnly | QIODevice::Text)) {
        QTextStream stream(&flagFile);
        stream << "Started at: " << QDateTime::currentDateTime().toString(Qt::ISODate) << "\n";
        stream << "PID: " << QCoreApplication::applicationPid() << "\n";
        flagFile.close();
    }

    // 安装 Qt 消息处理器
    qInstallMessageHandler(CrashHandler::messageHandler);

    // 安装 std::terminate 处理器
    std::set_terminate([]() {
        CrashHandler::instance()->writeCrashLog("std::terminate called - unhandled C++ exception");
        std::abort();
    });

    qDebug() << "CrashHandler initialized";
}

void CrashHandler::messageHandler(QtMsgType type, const QMessageLogContext &context, const QString &msg)
{
    QString level;
    switch (type) {
    case QtDebugMsg: level = "DEBUG"; break;
    case QtInfoMsg: level = "INFO"; break;
    case QtWarningMsg: level = "WARNING"; break;
    case QtCriticalMsg: level = "CRITICAL"; break;
    case QtFatalMsg: level = "FATAL"; break;
    }

    QString logMsg = QString("[%1] %2 (%3:%4) %5")
        .arg(level)
        .arg(QDateTime::currentDateTime().toString("HH:mm:ss.zzz"))
        .arg(context.file ? context.file : "unknown")
        .arg(context.line)
        .arg(msg);

    // 写入崩溃日志
    QString logPath = CrashHandler::instance()->crashLogPath();
    QFile logFile(logPath);
    if (logFile.open(QIODevice::Append | QIODevice::Text)) {
        QTextStream stream(&logFile);
        stream << logMsg << "\n";
        logFile.close();
    }

    // 输出到 stderr（调试用）
    fprintf(stderr, "%s\n", logMsg.toUtf8().constData());

    // FATAL 级别记录崩溃原因
    if (type == QtFatalMsg) {
        CrashHandler::instance()->writeCrashLog("Qt FATAL: " + msg);
    }
}

void CrashHandler::writeCrashLog(const QString &reason)
{
    QString info = QString("Crash at %1\nReason: %2\nPID: %3\n")
        .arg(QDateTime::currentDateTime().toString(Qt::ISODate))
        .arg(reason)
        .arg(QCoreApplication::applicationPid());

    // 写入崩溃标记（下次启动时检测）
    QFile flagFile(crashFlagPath());
    if (flagFile.open(QIODevice::WriteOnly | QIODevice::Text)) {
        QTextStream stream(&flagFile);
        stream << info;
        flagFile.close();
    }

    qCritical() << "CRASH:" << reason;
}

void CrashHandler::clearCrashFlag()
{
    QFile::remove(crashFlagPath());
    m_didCrash = false;
    m_lastCrashInfo.clear();
}

QString CrashHandler::crashFlagPath() const
{
    QString dataDir = QStandardPaths::writableLocation(QStandardPaths::AppDataLocation);
    QDir().mkpath(dataDir);
    return dataDir + "/.crash_flag";
}

QString CrashHandler::crashLogPath() const
{
    QString dataDir = QStandardPaths::writableLocation(QStandardPaths::AppDataLocation);
    QDir().mkpath(dataDir);
    return dataDir + "/crash.log";
}
