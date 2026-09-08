#include "OfflineDictionary.h"
#include <QSqlQuery>
#include <QSqlError>
#include <QDebug>
#include <QFileInfo>
#include <QStringList>

OfflineDictionary::OfflineDictionary(QObject *parent)
    : QObject(parent)
{
}

OfflineDictionary::~OfflineDictionary()
{
    if (m_db.isOpen()) {
        m_db.close();
    }
}

bool OfflineDictionary::init(const QString &dbPath)
{
    if (!QFileInfo::exists(dbPath)) {
        qWarning() << "Offline dictionary not found:" << dbPath;
        return false;
    }

    m_dbPath = dbPath;
    m_db = QSqlDatabase::addDatabase("QSQLITE", "ecdict");
    m_db.setDatabaseName(dbPath);

    if (!m_db.open()) {
        qWarning() << "Failed to open offline dictionary:" << m_db.lastError().text();
        return false;
    }

    qDebug() << "Offline dictionary loaded:" << dbPath;
    return true;
}

QVariantMap OfflineDictionary::lookup(const QString &word)
{
    QVariantMap result;
    if (!m_db.isOpen() || word.trimmed().isEmpty()) return result;

    QString cleanWord = word.trimmed().toLower();

    QSqlQuery query(m_db);
    query.prepare("SELECT word, phonetic, definition, translation, pos, collins, oxford, tag, exchange "
                  "FROM stardict WHERE word = ? OR sw = ? LIMIT 1");
    query.addBindValue(cleanWord);
    query.addBindValue(cleanWord);

    if (!query.exec()) {
        qWarning() << "Dictionary lookup error:" << query.lastError().text();
        return result;
    }

    if (!query.next()) return result;

    QString dbWord = query.value(0).toString();
    QString phonetic = query.value(1).toString();
    QString definition = query.value(2).toString();
    QString translation = query.value(3).toString();
    QString pos = query.value(4).toString();
    int collins = query.value(5).toInt();
    int oxford = query.value(6).toInt();
    QString tag = query.value(7).toString();
    QString exchange = query.value(8).toString();

    // 解析中文释义（每行一个，提取词性前缀）
    QVariantList definitions;
    QStringList transLines = translation.split('\n', Qt::SkipEmptyParts);
    for (const QString &line : transLines) {
        QString trimmed = line.trimmed();
        if (trimmed.isEmpty()) continue;

        // 提取词性前缀（如 "a. 有效率的"）
        QString partOfSpeech;
        QString meaning = trimmed;

        // 常见词性前缀（ECDICT 格式）
        QStringList posPrefixes = {
            "n.", "v.", "vt.", "vi.", "adj.", "adv.", "prep.",
            "conj.", "pron.", "num.", "art.", "int.", "aux.",
            "a.", "ad.", "vt&vi.", "vi&vt."
        };

        // 按长度降序排列，优先匹配长的
        std::sort(posPrefixes.begin(), posPrefixes.end(), [](const QString &a, const QString &b) {
            return a.length() > b.length();
        });

        for (const QString &prefix : posPrefixes) {
            if (trimmed.startsWith(prefix, Qt::CaseInsensitive)) {
                partOfSpeech = prefix;
                meaning = trimmed.mid(prefix.length()).trimmed();
                break;
            }
        }

        // 标准化词性显示
        if (partOfSpeech == "a.") partOfSpeech = "adj.";
        if (partOfSpeech == "ad.") partOfSpeech = "adv.";

        QVariantMap def;
        def["partOfSpeech"] = partOfSpeech;
        def["meaning"] = meaning;
        definitions.append(def);
    }

    // 如果没有解析到词性，用第一个释义的整体
    if (definitions.isEmpty() && !translation.isEmpty()) {
        QVariantMap def;
        def["partOfSpeech"] = "";
        def["meaning"] = translation;
        definitions.append(def);
    }

    // 解析英文释义
    QString englishDefinition;
    if (!definition.isEmpty()) {
        // 去掉词性前缀
        QStringList defLines = definition.split('\n', Qt::SkipEmptyParts);
        if (!defLines.isEmpty()) {
            englishDefinition = defLines.first().trimmed();
            // 去掉开头的词性前缀
            QStringList posPrefixes = {"a.", "n.", "v.", "vt.", "vi.", "adj.", "adv."};
            for (const QString &prefix : posPrefixes) {
                if (englishDefinition.startsWith(prefix, Qt::CaseInsensitive)) {
                    englishDefinition = englishDefinition.mid(prefix.length()).trimmed();
                    break;
                }
            }
        }
    }

    // 解析考试标签
    QVariantList tags;
    if (!tag.isEmpty()) {
        QStringList tagList = tag.split(' ', Qt::SkipEmptyParts);
        QMap<QString, QString> tagNames = {
            {"cet4", "四级"}, {"cet6", "六级"}, {"ky", "考研"},
            {"toefl", "托福"}, {"ielts", "雅思"}, {"gre", "GRE"},
            {"sat", "SAT"}, {"gmat", "GMAT"}
        };
        for (const QString &t : tagList) {
            QString name = tagNames.value(t.toLower(), t);
            tags.append(name);
        }
    }

    // 解析词形变化（exchange 字段）
    QVariantList wordForms;
    if (!exchange.isEmpty()) {
        QMap<QString, QString> formNames = {
            {"i", "现在分词"}, {"p", "过去式"}, {"d", "过去分词"},
            {"3", "三单"}, {"s", "复数"}, {"r", "比较级"}, {"t", "最高级"}
        };

        QStringList forms = exchange.split('/', Qt::SkipEmptyParts);
        for (const QString &form : forms) {
            int colonIdx = form.indexOf(':');
            if (colonIdx > 0) {
                QString key = form.left(colonIdx);
                QString value = form.mid(colonIdx + 1);
                QString name = formNames.value(key, key);
                QVariantMap wf;
                wf["name"] = name;
                wf["value"] = value;
                wordForms.append(wf);
            }
        }
    }

    // 第一个释义作为简要翻译
    QString briefTranslation;
    if (!definitions.isEmpty()) {
        briefTranslation = definitions.first().toMap().value("meaning").toString();
    } else {
        briefTranslation = translation;
    }

    result["word"] = dbWord;
    result["phonetic"] = phonetic;
    result["englishDefinition"] = englishDefinition;
    result["translation"] = translation;
    result["briefTranslation"] = briefTranslation;
    result["definitions"] = definitions;
    result["wordForms"] = wordForms;
    result["collins"] = collins;
    result["oxford"] = oxford;
    result["tags"] = tags;
    result["exchange"] = exchange;
    result["found"] = true;
    result["isWord"] = true;

    return result;
}

bool OfflineDictionary::isWord(const QString &text)
{
    if (!m_db.isOpen() || text.trimmed().isEmpty()) return false;

    QString clean = text.trimmed();
    if (clean.length() > 64) return false;

    for (QChar c : clean) {
        if (!c.isLetter() && c != '-' && c != '\'') return false;
    }

    QVariantMap result = lookup(clean);
    return result.value("found", false).toBool();
}
