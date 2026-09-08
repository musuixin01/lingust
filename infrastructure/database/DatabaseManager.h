#pragma once

#include <QObject>
#include <QSqlDatabase>
#include <QVariantList>
#include <QVariantMap>

class DatabaseManager : public QObject
{
    Q_OBJECT
public:
    explicit DatabaseManager(QObject *parent = nullptr);
    ~DatabaseManager() override;

    bool init();

    // 历史记录
    Q_INVOKABLE void addHistory(const QString &sourceText, const QString &translatedText,
                                const QString &sourceLang, const QString &targetLang,
                                const QString &engine);
    Q_INVOKABLE QVariantList getHistory(int limit = 50);
    Q_INVOKABLE void clearHistory();
    Q_INVOKABLE void deleteHistory(int id);

    // 收藏
    Q_INVOKABLE void addFavorite(const QString &sourceText, const QString &translatedText,
                                 const QString &sourceLang, const QString &targetLang,
                                 const QString &phonetic = "", const QString &definitions = "");
    Q_INVOKABLE QVariantList getFavorites();
    Q_INVOKABLE void removeFavorite(int id);
    Q_INVOKABLE bool isFavorite(const QString &sourceText);

private:
    bool createTables();
    QSqlDatabase m_db;
};
