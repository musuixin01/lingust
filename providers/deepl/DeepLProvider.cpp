#include "DeepLProvider.h"
#include <QJsonDocument>
#include <QJsonObject>
#include <QJsonArray>
#include <QUrlQuery>

DeepLProvider::DeepLProvider(QObject *parent)
    : ITranslationProvider(parent)
    , m_network(new QNetworkAccessManager(this))
{
}

void DeepLProvider::translate(const QString &text, const QString &sourceLang, const QString &targetLang)
{
    if (m_apiKey.isEmpty()) {
        emit translationError("DeepL API Key 未配置");
        return;
    }

    // DeepL Free 版用 api-free.deepl.com，Pro 版用 api.deepl.com
    QString baseUrl = m_apiKey.endsWith(":fx") ? "https://api-free.deepl.com" : "https://api.deepl.com";
    QUrl url(baseUrl + "/v2/translate");

    QUrlQuery params;
    params.addQueryItem("text", text);
    params.addQueryItem("target_lang", targetLang.toUpper());
    if (sourceLang != "auto") {
        params.addQueryItem("source_lang", sourceLang.toUpper());
    }

    QNetworkRequest request(url);
    request.setHeader(QNetworkRequest::ContentTypeHeader, "application/x-www-form-urlencoded");
    request.setRawHeader("Authorization", QString("DeepL-Auth-Key %1").arg(m_apiKey).toUtf8());
    request.setTransferTimeout(15000); // 15秒超时

    QNetworkReply *reply = m_network->post(request, params.toString(QUrl::FullyEncoded).toUtf8());
    connect(reply, &QNetworkReply::finished, this, &DeepLProvider::onReplyFinished);
}

void DeepLProvider::onReplyFinished()
{
    QNetworkReply *reply = qobject_cast<QNetworkReply*>(sender());
    if (!reply) return;

    if (reply->error() != QNetworkReply::NoError) {
        emit translationError(QString("DeepL 错误: %1").arg(reply->errorString()));
        reply->deleteLater();
        return;
    }

    QByteArray data = reply->readAll();
    reply->deleteLater();

    QJsonDocument doc = QJsonDocument::fromJson(data);
    if (!doc.isObject()) {
        emit translationError("解析 DeepL 响应失败");
        return;
    }

    QJsonObject root = doc.object();
    QJsonArray translations = root.value("translations").toArray();
    if (translations.isEmpty()) {
        emit translationError("DeepL 无翻译结果");
        return;
    }

    QString translated = translations.first().toObject().value("text").toString();

    QVariantMap result;
    result["translatedText"] = translated;
    result["isWord"] = false;
    result["engine"] = "deepl";
    emit translationReady(result);
}
