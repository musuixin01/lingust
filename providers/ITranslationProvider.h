#pragma once

#include <QObject>
#include <QString>
#include <QVariantMap>

class ITranslationProvider : public QObject
{
    Q_OBJECT
public:
    explicit ITranslationProvider(QObject *parent = nullptr) : QObject(parent) {}
    virtual ~ITranslationProvider() = default;

    virtual QString name() const = 0;
    virtual void translate(const QString &text, const QString &sourceLang, const QString &targetLang) = 0;
    virtual void setApiKey(const QString &key) { m_apiKey = key; }
    virtual void setApiSecret(const QString &secret) { m_apiSecret = secret; }

signals:
    void translationReady(const QVariantMap &result);
    void translationError(const QString &error);

protected:
    QString m_apiKey;
    QString m_apiSecret;
};
