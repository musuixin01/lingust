#pragma once

#include <QObject>
#include <QImage>
#include <QString>
#include "../../providers/ocr/IOcrProvider.h"

class OcrManager : public QObject
{
    Q_OBJECT
public:
    explicit OcrManager(QObject *parent = nullptr);

    Q_INVOKABLE void recognize(const QImage &image);
    void setProvider(IOcrProvider *provider);

signals:
    void recognitionReady(const QString &text);
    void recognitionError(const QString &error);

private:
    IOcrProvider *m_provider;
};
