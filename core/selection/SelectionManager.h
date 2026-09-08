#pragma once

#include <QObject>
#include <QString>
#include <QTimer>

class SelectionManager : public QObject
{
    Q_OBJECT
public:
    explicit SelectionManager(QObject *parent = nullptr);
    ~SelectionManager() override;

    Q_INVOKABLE void triggerSelectionTranslation();
    Q_INVOKABLE void setEnabled(bool enabled);
    bool isEnabled() const { return m_enabled; }

signals:
    void textSelected(const QString &text);

private:
    void simulateCopy();
    QString readClipboardText();
    void restoreClipboard(const QString &previousText);

    bool m_enabled;
    QTimer m_clipboardTimer;
    QString m_previousClipboard;
    quint32 m_previousSeq;
    int m_waitCount;
};
