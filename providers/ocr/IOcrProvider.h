#pragma once

#include <QObject>
#include <QString>
#include <QImage>

class IOcrProvider : public QObject
{
    Q_OBJECT
public:
    explicit IOcrProvider(QObject *parent = nullptr) : QObject(parent) {}
    virtual ~IOcrProvider() = default;

    virtual QString name() const = 0;
    virtual void recognize(const QImage &image) = 0;

signals:
    void recognitionReady(const QString &text);
    void recognitionError(const QString &error);
};
