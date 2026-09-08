#pragma once

#include "../ITranslationProvider.h"
#include <QNetworkAccessManager>
#include <QNetworkReply>

class YoudaoProvider : public ITranslationProvider
{
    Q_OBJECT
public:
    explicit YoudaoProvider(QObject *parent = nullptr);

    QString name() const override { return "youdao"; }
    void translate(const QString &text, const QString &sourceLang, const QString &targetLang) override;

private slots:
    void onReplyFinished();

private:
    QNetworkAccessManager *m_network;
    QString generateSign(const QString &text, const QString &salt, const QString &curtime);
};
