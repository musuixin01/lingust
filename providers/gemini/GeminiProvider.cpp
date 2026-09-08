#include "GeminiProvider.h"
#include <QJsonDocument>
#include <QJsonObject>
#include <QJsonArray>
#include <QUrlQuery>

GeminiProvider::GeminiProvider(QObject *parent)
    : ITranslationProvider(parent)
    , m_network(new QNetworkAccessManager(this))
{
}

QString GeminiProvider::buildPrompt(const QString &text, const QString &sourceLang, const QString &targetLang)
{
    return QString(
        "你是一个专业翻译引擎。请将以下%1文本翻译成%2。\n"
        "如果是单词，请额外提供：音标(美音/英音)、词性释义、2个双语例句、3个同义词。\n"
        "输出严格为JSON格式：{\"translatedText\":\"...\",\"isWord\":true/false,\"phonetic\":{\"us\":\"...\",\"uk\":\"...\"},\"definitions\":[{\"partOfSpeech\":\"...\",\"meaning\":\"...\"}],\"examples\":[{\"src\":\"...\",\"dst\":\"...\"}],\"synonyms\":[\"...\"]}\n\n"
        "原文：%3"
    ).arg(sourceLang, targetLang, text);
}

void GeminiProvider::translate(const QString &text, const QString &sourceLang, const QString &targetLang)
{
    if (m_apiKey.isEmpty()) {
        emit translationError("Gemini API Key 未配置");
        return;
    }

    QUrl url("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent");
    QUrlQuery query;
    query.addQueryItem("key", m_apiKey);
    url.setQuery(query);

    QJsonObject contentObj;
    QJsonObject partObj;
    partObj["text"] = buildPrompt(text, sourceLang, targetLang);
    QJsonArray partsArray;
    partsArray.append(partObj);
    contentObj["parts"] = partsArray;

    QJsonObject root;
    QJsonArray contentsArray;
    contentsArray.append(contentObj);
    root["contents"] = contentsArray;

    QJsonObject generationConfig;
    generationConfig["temperature"] = 0.3;
    generationConfig["maxOutputTokens"] = 1024;
    root["generationConfig"] = generationConfig;

    QNetworkRequest request(url);
    request.setHeader(QNetworkRequest::ContentTypeHeader, "application/json");
    request.setTransferTimeout(15000); // 15秒超时

    QByteArray body = QJsonDocument(root).toJson();
    QNetworkReply *reply = m_network->post(request, body);
    connect(reply, &QNetworkReply::finished, this, &GeminiProvider::onReplyFinished);
}

void GeminiProvider::onReplyFinished()
{
    QNetworkReply *reply = qobject_cast<QNetworkReply*>(sender());
    if (!reply) return;

    if (reply->error() != QNetworkReply::NoError) {
        emit translationError(QString("网络错误: %1").arg(reply->errorString()));
        reply->deleteLater();
        return;
    }

    QByteArray data = reply->readAll();
    reply->deleteLater();

    QVariantMap result = parseResponse(data);
    if (result.isEmpty()) {
        emit translationError("解析 Gemini 响应失败");
    } else {
        emit translationReady(result);
    }
}

QVariantMap GeminiProvider::parseResponse(const QByteArray &data)
{
    QJsonDocument doc = QJsonDocument::fromJson(data);
    if (!doc.isObject()) return {};

    QJsonObject root = doc.object();
    QJsonArray candidates = root.value("candidates").toArray();
    if (candidates.isEmpty()) return {};

    QJsonObject candidate = candidates.first().toObject();
    QJsonObject content = candidate.value("content").toObject();
    QJsonArray parts = content.value("parts").toArray();
    if (parts.isEmpty()) return {};

    QString text = parts.first().toObject().value("text").toString();

    // 尝试解析 JSON
    int jsonStart = text.indexOf('{');
    int jsonEnd = text.lastIndexOf('}');
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
        QString jsonStr = text.mid(jsonStart, jsonEnd - jsonStart + 1);
        QJsonDocument resultDoc = QJsonDocument::fromJson(jsonStr.toUtf8());
        if (resultDoc.isObject()) {
            QVariantMap result = resultDoc.object().toVariantMap();
            result["engine"] = "gemini";
            return result;
        }
    }

    // 纯文本翻译
    QVariantMap result;
    result["translatedText"] = text.trimmed();
    result["isWord"] = false;
    result["engine"] = "gemini";
    return result;
}
