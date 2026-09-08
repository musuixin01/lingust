#include "YoudaoProvider.h"
#include <QJsonDocument>
#include <QJsonObject>
#include <QJsonArray>
#include <QUrlQuery>
#include <QCryptographicHash>
#include <QDateTime>
#include <QRandomGenerator>

YoudaoProvider::YoudaoProvider(QObject *parent)
    : ITranslationProvider(parent)
    , m_network(new QNetworkAccessManager(this))
{
}

QString YoudaoProvider::generateSign(const QString &text, const QString &salt, const QString &curtime)
{
    // 有道签名规则：sign = sha256(appKey + input + salt + curtime + appSecret)
    // input = text长度>20 ? 前10字符+长度+后10字符 : text
    QString input;
    if (text.length() > 20) {
        input = text.left(10) + QString::number(text.length()) + text.right(10);
    } else {
        input = text;
    }

    QString signStr = m_apiKey + input + salt + curtime + m_apiSecret;
    QByteArray hash = QCryptographicHash::hash(signStr.toUtf8(), QCryptographicHash::Sha256);
    return QString(hash.toHex());
}

void YoudaoProvider::translate(const QString &text, const QString &sourceLang, const QString &targetLang)
{
    if (m_apiKey.isEmpty() || m_apiSecret.isEmpty()) {
        emit translationError("有道 AppKey 或 AppSecret 未配置");
        return;
    }

    QString salt = QString::number(QRandomGenerator::global()->generate());
    QString curtime = QString::number(QDateTime::currentSecsSinceEpoch());
    QString sign = generateSign(text, salt, curtime);

    QUrl url("https://openapi.youdao.com/api");
    QUrlQuery params;
    params.addQueryItem("q", text);
    params.addQueryItem("from", sourceLang == "auto" ? "auto" : sourceLang);
    params.addQueryItem("to", targetLang);
    params.addQueryItem("appKey", m_apiKey);
    params.addQueryItem("salt", salt);
    params.addQueryItem("sign", sign);
    params.addQueryItem("signType", "v3");
    params.addQueryItem("curtime", curtime);

    QNetworkRequest request(url);
    request.setHeader(QNetworkRequest::ContentTypeHeader, "application/x-www-form-urlencoded");
    request.setTransferTimeout(15000); // 15秒超时

    QNetworkReply *reply = m_network->post(request, params.toString(QUrl::FullyEncoded).toUtf8());
    connect(reply, &QNetworkReply::finished, this, &YoudaoProvider::onReplyFinished);
}

void YoudaoProvider::onReplyFinished()
{
    QNetworkReply *reply = qobject_cast<QNetworkReply*>(sender());
    if (!reply) return;

    if (reply->error() != QNetworkReply::NoError) {
        emit translationError(QString("有道错误: %1").arg(reply->errorString()));
        reply->deleteLater();
        return;
    }

    QByteArray data = reply->readAll();
    reply->deleteLater();

    QJsonDocument doc = QJsonDocument::fromJson(data);
    if (!doc.isObject()) {
        emit translationError("解析有道响应失败");
        return;
    }

    QJsonObject root = doc.object();
    QString errorCode = root.value("errorCode").toString();
    if (errorCode != "0") {
        emit translationError(QString("有道错误码: %1").arg(errorCode));
        return;
    }

    QVariantMap result;
    result["translatedText"] = root.value("translation").toArray().first().toString();
    result["isWord"] = root.contains("basic");
    result["engine"] = "youdao";

    // 单词详情
    if (root.contains("basic")) {
        QJsonObject basic = root.value("basic").toObject();
        QVariantMap phonetic;
        if (basic.contains("us-phonetic")) phonetic["us"] = basic.value("us-phonetic").toString();
        if (basic.contains("uk-phonetic")) phonetic["uk"] = basic.value("uk-phonetic").toString();
        result["phonetic"] = phonetic;

        QVariantList definitions;
        for (const QJsonValue &exp : basic.value("explains").toArray()) {
            QVariantMap def;
            def["partOfSpeech"] = "";
            def["meaning"] = exp.toString();
            definitions.append(def);
        }
        result["definitions"] = definitions;
    }

    // 双语例句
    if (root.contains("web")) {
        QVariantList examples;
        for (const QJsonValue &web : root.value("web").toArray()) {
            QJsonObject w = web.toObject();
            QVariantMap ex;
            ex["src"] = w.value("key").toString();
            ex["dst"] = w.value("value").toArray().first().toString();
            examples.append(ex);
            if (examples.size() >= 2) break;
        }
        result["examples"] = examples;
    }

    emit translationReady(result);
}
