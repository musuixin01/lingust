#pragma once

#include "../ITranslationProvider.h"
#include <QNetworkAccessManager>
#include <QNetworkReply>

class GeminiProvider : public ITranslationProvider
{
    Q_OBJECT
public:
    explicit GeminiProvider(QObject *parent = nullptr);

    QString name() const override { return "gemini"; }
    void translate(const QString &text, const QString &sourceLang, const QString &targetLang) override;

private slots:
    void onReplyFinished();

private:
    QNetworkAccessManager *m_network;
    QString buildPrompt(const QString &text, const QString &sourceLang, const QString &targetLang);
    QVariantMap parseResponse(const QByteArray &data);
};
