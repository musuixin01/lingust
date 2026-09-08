#pragma once

#include "../ITranslationProvider.h"
#include <QNetworkAccessManager>
#include <QNetworkReply>

class DeepLProvider : public ITranslationProvider
{
    Q_OBJECT
public:
    explicit DeepLProvider(QObject *parent = nullptr);

    QString name() const override { return "deepl"; }
    void translate(const QString &text, const QString &sourceLang, const QString &targetLang) override;

private slots:
    void onReplyFinished();

private:
    QNetworkAccessManager *m_network;
};
