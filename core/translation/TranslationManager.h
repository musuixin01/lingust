#pragma once

#include <QObject>
#include <QVariantMap>
#include <QStringList>
#include "../../providers/ITranslationProvider.h"

class TranslationManager : public QObject
{
    Q_OBJECT
public:
    enum ErrorType {
        NoError = 0,
        NetworkError,
        ApiKeyError,
        RateLimitError,
        ServiceUnavailable,
        InvalidResponse,
        UnknownError
    };

    explicit TranslationManager(QObject *parent = nullptr);

    void setEngine(const QString &engine);
    void setApiKey(const QString &engine, const QString &key);
    void setApiSecret(const QString &engine, const QString &secret);
    void translate(const QString &text, const QString &sourceLang, const QString &targetLang);

    void setFallbackEngines(const QStringList &engines) { m_fallbackEngines = engines; }
    void setMaxRetries(int count) { m_maxRetries = count; }

    static ErrorType classifyError(const QString &error);
    static QString userFriendlyError(ErrorType type, const QString &rawError);

signals:
    void translationReady(const QVariantMap &result);
    void translationError(const QString &error);
    void engineFallback(const QString &fromEngine, const QString &toEngine, const QString &reason);

private:
    void tryNextEngine();
    void retryCurrentEngine();

    QMap<QString, ITranslationProvider*> m_providers;
    QString m_currentEngine;
    QStringList m_fallbackEngines;
    int m_maxRetries;
    int m_retryCount;
    int m_fallbackIndex;

    QString m_pendingText;
    QString m_pendingSourceLang;
    QString m_pendingTargetLang;
    QStringList m_triedEngines;

    ITranslationProvider* getProvider(const QString &engine);
};
