#pragma once

#include <QObject>
#include <QString>
#include <QVariantMap>
#include <QSqlDatabase>

class OfflineDictionary : public QObject
{
    Q_OBJECT
public:
    explicit OfflineDictionary(QObject *parent = nullptr);
    ~OfflineDictionary() override;

    bool init(const QString &dbPath);
    bool isAvailable() const { return m_db.isOpen(); }

    Q_INVOKABLE QVariantMap lookup(const QString &word);
    Q_INVOKABLE bool isWord(const QString &text);

private:
    QSqlDatabase m_db;
    QString m_dbPath;
};
