#include "DatabaseManager.h"
#include <QSqlQuery>
#include <QSqlError>
#include <QStandardPaths>
#include <QDir>
#include <QDebug>

DatabaseManager::DatabaseManager(QObject *parent)
    : QObject(parent)
{
}

DatabaseManager::~DatabaseManager()
{
    if (m_db.isOpen()) {
        m_db.close();
    }
}

bool DatabaseManager::init()
{
    QString dataPath = QStandardPaths::writableLocation(QStandardPaths::AppDataLocation);
    QDir().mkpath(dataPath);
    QString dbPath = dataPath + "/lingust.db";

    m_db = QSqlDatabase::addDatabase("QSQLITE");
    m_db.setDatabaseName(dbPath);

    if (!m_db.open()) {
        qWarning() << "Failed to open database:" << m_db.lastError().text();
        return false;
    }

    return createTables();
}

bool DatabaseManager::createTables()
{
    QSqlQuery query;

    // 历史记录表
    QString createHistory = R"(
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_text TEXT NOT NULL,
            translated_text TEXT,
            source_lang TEXT,
            target_lang TEXT,
            engine TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    )";
    if (!query.exec(createHistory)) {
        qWarning() << "Failed to create history table:" << query.lastError().text();
        return false;
    }

    // 收藏表
    QString createFavorites = R"(
        CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_text TEXT NOT NULL UNIQUE,
            translated_text TEXT,
            source_lang TEXT,
            target_lang TEXT,
            phonetic TEXT,
            definitions TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    )";
    if (!query.exec(createFavorites)) {
        qWarning() << "Failed to create favorites table:" << query.lastError().text();
        return false;
    }

    return true;
}

void DatabaseManager::addHistory(const QString &sourceText, const QString &translatedText,
                                  const QString &sourceLang, const QString &targetLang,
                                  const QString &engine)
{
    QSqlQuery query;
    query.prepare("INSERT INTO history (source_text, translated_text, source_lang, target_lang, engine) "
                  "VALUES (?, ?, ?, ?, ?)");
    query.addBindValue(sourceText);
    query.addBindValue(translatedText);
    query.addBindValue(sourceLang);
    query.addBindValue(targetLang);
    query.addBindValue(engine);
    query.exec();
}

QVariantList DatabaseManager::getHistory(int limit)
{
    QVariantList result;
    QSqlQuery query;
    query.prepare("SELECT id, source_text, translated_text, source_lang, target_lang, engine, timestamp "
                  "FROM history ORDER BY timestamp DESC LIMIT ?");
    query.addBindValue(limit);
    query.exec();

    while (query.next()) {
        QVariantMap item;
        item["id"] = query.value(0).toInt();
        item["sourceText"] = query.value(1).toString();
        item["translatedText"] = query.value(2).toString();
        item["sourceLang"] = query.value(3).toString();
        item["targetLang"] = query.value(4).toString();
        item["engine"] = query.value(5).toString();
        item["timestamp"] = query.value(6).toString();
        result.append(item);
    }
    return result;
}

void DatabaseManager::clearHistory()
{
    QSqlQuery query;
    query.exec("DELETE FROM history");
}

void DatabaseManager::deleteHistory(int id)
{
    QSqlQuery query;
    query.prepare("DELETE FROM history WHERE id = ?");
    query.addBindValue(id);
    query.exec();
}

void DatabaseManager::addFavorite(const QString &sourceText, const QString &translatedText,
                                   const QString &sourceLang, const QString &targetLang,
                                   const QString &phonetic, const QString &definitions)
{
    QSqlQuery query;
    query.prepare("INSERT OR REPLACE INTO favorites (source_text, translated_text, source_lang, target_lang, phonetic, definitions) "
                  "VALUES (?, ?, ?, ?, ?, ?)");
    query.addBindValue(sourceText);
    query.addBindValue(translatedText);
    query.addBindValue(sourceLang);
    query.addBindValue(targetLang);
    query.addBindValue(phonetic);
    query.addBindValue(definitions);
    query.exec();
}

QVariantList DatabaseManager::getFavorites()
{
    QVariantList result;
    QSqlQuery query;
    query.exec("SELECT id, source_text, translated_text, source_lang, target_lang, phonetic, definitions, timestamp "
               "FROM favorites ORDER BY timestamp DESC");

    while (query.next()) {
        QVariantMap item;
        item["id"] = query.value(0).toInt();
        item["sourceText"] = query.value(1).toString();
        item["translatedText"] = query.value(2).toString();
        item["sourceLang"] = query.value(3).toString();
        item["targetLang"] = query.value(4).toString();
        item["phonetic"] = query.value(5).toString();
        item["definitions"] = query.value(6).toString();
        item["timestamp"] = query.value(7).toString();
        result.append(item);
    }
    return result;
}

void DatabaseManager::removeFavorite(int id)
{
    QSqlQuery query;
    query.prepare("DELETE FROM favorites WHERE id = ?");
    query.addBindValue(id);
    query.exec();
}

bool DatabaseManager::isFavorite(const QString &sourceText)
{
    QSqlQuery query;
    query.prepare("SELECT COUNT(*) FROM favorites WHERE source_text = ?");
    query.addBindValue(sourceText);
    query.exec();
    if (query.next()) {
        return query.value(0).toInt() > 0;
    }
    return false;
}
