#include "TranslationManager.h"
#include "../../providers/gemini/GeminiProvider.h"
#include "../../providers/deepl/DeepLProvider.h"
#include "../../providers/youdao/YoudaoProvider.h"
#include <QTimer>
#include <QDebug>

TranslationManager::TranslationManager(QObject *parent)
    : QObject(parent)
    , m_currentEngine("gemini")
    , m_maxRetries(2)
    , m_retryCount(0)
    , m_fallbackIndex(0)
{
    m_providers["gemini"] = new GeminiProvider(this);
    m_providers["deepl"] = new DeepLProvider(this);
    m_providers["youdao"] = new YoudaoProvider(this);

    // 默认降级顺序：gemini -> deepl -> youdao -> offline
    m_fallbackEngines = {"deepl", "youdao", "offline"};

    for (auto *provider : m_providers) {
        connect(provider, &ITranslationProvider::translationReady,
                this, &TranslationManager::translationReady);
        connect(provider, &ITranslationProvider::translationError,
                this, [this](const QString &error) {
            ErrorType type = classifyError(error);

            // API Key 错误不重试，直接降级
            if (type == ApiKeyError) {
                qWarning() << "API Key error for" << m_currentEngine << ", falling back";
                emit engineFallback(m_currentEngine, "next", error);
                tryNextEngine();
                return;
            }

            // 网络错误/服务不可用可以重试
            if ((type == NetworkError || type == ServiceUnavailable || type == UnknownError)
                && m_retryCount < m_maxRetries) {
                m_retryCount++;
                qWarning() << "Error for" << m_currentEngine << ", retry" << m_retryCount
                           << "/" << m_maxRetries << ":" << error;
                QTimer::singleShot(500 * m_retryCount, this, &TranslationManager::retryCurrentEngine);
                return;
            }

            // 重试耗尽，尝试降级
            qWarning() << "Retries exhausted for" << m_currentEngine << ", falling back";
            emit engineFallback(m_currentEngine, "next", error);
            tryNextEngine();
        });
    }
}

void TranslationManager::setEngine(const QString &engine)
{
    if (m_providers.contains(engine) || engine == "offline") {
        m_currentEngine = engine;
    }
}

void TranslationManager::setApiKey(const QString &engine, const QString &key)
{
    if (m_providers.contains(engine)) {
        m_providers[engine]->setApiKey(key);
    }
}

void TranslationManager::setApiSecret(const QString &engine, const QString &secret)
{
    if (m_providers.contains(engine)) {
        m_providers[engine]->setApiSecret(secret);
    }
}

ITranslationProvider* TranslationManager::getProvider(const QString &engine)
{
    return m_providers.value(engine, nullptr);
}

void TranslationManager::translate(const QString &text, const QString &sourceLang, const QString &targetLang)
{
    m_pendingText = text;
    m_pendingSourceLang = sourceLang;
    m_pendingTargetLang = targetLang;
    m_retryCount = 0;
    m_fallbackIndex = 0;
    m_triedEngines.clear();
    m_triedEngines.append(m_currentEngine);

    if (m_currentEngine == "offline") {
        QVariantMap result;
        result["translatedText"] = text;
        result["isWord"] = false;
        result["engine"] = "offline";
        emit translationReady(result);
        return;
    }

    ITranslationProvider *provider = getProvider(m_currentEngine);
    if (!provider) {
        emit translationError("未知翻译引擎: " + m_currentEngine);
        return;
    }

    provider->translate(text, sourceLang, targetLang);
}

void TranslationManager::retryCurrentEngine()
{
    ITranslationProvider *provider = getProvider(m_currentEngine);
    if (provider) {
        provider->translate(m_pendingText, m_pendingSourceLang, m_pendingTargetLang);
    }
}

void TranslationManager::tryNextEngine()
{
    // 找到下一个未尝试过的降级引擎
    while (m_fallbackIndex < m_fallbackEngines.size()) {
        QString nextEngine = m_fallbackEngines[m_fallbackIndex];
        m_fallbackIndex++;

        if (m_triedEngines.contains(nextEngine)) continue;
        m_triedEngines.append(nextEngine);

        if (nextEngine == "offline") {
            qWarning() << "Falling back to offline mode";
            QVariantMap result;
            result["translatedText"] = m_pendingText;
            result["isWord"] = false;
            result["engine"] = "offline";
            emit translationReady(result);
            return;
        }

        ITranslationProvider *provider = getProvider(nextEngine);
        if (provider) {
            qWarning() << "Falling back to" << nextEngine;
            m_retryCount = 0;
            provider->translate(m_pendingText, m_pendingSourceLang, m_pendingTargetLang);
            return;
        }
    }

    // 所有引擎都失败了
    emit translationError("所有翻译引擎均不可用，请检查网络连接或 API Key 配置");
}

TranslationManager::ErrorType TranslationManager::classifyError(const QString &error)
{
    QString lower = error.toLower();

    if (lower.contains("api key") || lower.contains("apikey") || lower.contains("未配置")
        || lower.contains("401") || lower.contains("unauthorized") || lower.contains("invalid key")) {
        return ApiKeyError;
    }

    if (lower.contains("429") || lower.contains("rate limit") || lower.contains("quota")
        || lower.contains("too many requests") || lower.contains("配额")) {
        return RateLimitError;
    }

    if (lower.contains("503") || lower.contains("502") || lower.contains("500")
        || lower.contains("service unavailable") || lower.contains("server error")
        || lower.contains("超时") || lower.contains("timeout")) {
        return ServiceUnavailable;
    }

    if (lower.contains("网络错误") || lower.contains("network") || lower.contains("connection")
        || lower.contains("host not found") || lower.contains("refused")) {
        return NetworkError;
    }

    if (lower.contains("解析") || lower.contains("parse") || lower.contains("invalid response")
        || lower.contains("json")) {
        return InvalidResponse;
    }

    return UnknownError;
}

QString TranslationManager::userFriendlyError(ErrorType type, const QString &rawError)
{
    switch (type) {
    case ApiKeyError:
        return "API Key 无效或未配置，请在设置中检查";
    case RateLimitError:
        return "请求过于频繁，请稍后再试";
    case ServiceUnavailable:
        return "翻译服务暂时不可用，已尝试切换其他引擎";
    case NetworkError:
        return "网络连接失败，请检查网络";
    case InvalidResponse:
        return "翻译响应解析失败";
    case UnknownError:
    default:
        return "翻译失败: " + rawError;
    }
}
