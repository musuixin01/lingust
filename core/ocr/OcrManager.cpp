#include "OcrManager.h"

OcrManager::OcrManager(QObject *parent)
    : QObject(parent)
    , m_provider(nullptr)
{
}

void OcrManager::recognize(const QImage &image)
{
    if (!m_provider) {
        emit recognitionError("未配置 OCR 引擎");
        return;
    }
    m_provider->recognize(image);
}

void OcrManager::setProvider(IOcrProvider *provider)
{
    if (m_provider) {
        disconnect(m_provider, nullptr, this, nullptr);
    }
    m_provider = provider;
    if (m_provider) {
        connect(m_provider, &IOcrProvider::recognitionReady, this, &OcrManager::recognitionReady);
        connect(m_provider, &IOcrProvider::recognitionError, this, &OcrManager::recognitionError);
    }
}
