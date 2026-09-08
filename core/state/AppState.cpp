#include "AppState.h"
#include "../../infrastructure/crash/CrashHandler.h"

#include <QGuiApplication>
#include <QClipboard>
#include <QProcess>
#include <QDebug>
#include <QDateTime>
#include <QFileInfo>
#include <QCoreApplication>
#include <QDir>

AppState::AppState(QObject *parent)
    : QObject(parent)
    , m_sourceText("Efficient")
    , m_translatedText("高效的")
    , m_sourceLang("en")
    , m_targetLang("zh")
    , m_isTranslating(false)
    , m_isWord(true)
    , m_phoneticUs("/ɪˈfɪʃnt/")
    , m_phoneticUk("/ɪˈfɪʃ(ə)nt/")
    , m_isFavorite(false)
    , m_engine("gemini")
    , m_justCopied(false)
    , m_isPinned(false)
    , m_compactMode(false)
    , m_selectionTranslation(true)
    , m_selectionTriggerMode("auto")
    , m_autoSpeak(false)
    , m_cardOpacity(0.95)
    , m_fontSizePercent(100)
    , m_translationManager(new TranslationManager(this))
    , m_offlineDict(new OfflineDictionary(this))
    , m_database(new DatabaseManager(this))
    , m_selectionManager(new SelectionManager(this))
    , m_mediaSession(new MediaSessionService(this))
    , m_pillMusicMode(false)
{
    m_definitions = {
        QVariantMap{{"partOfSpeech", "adj."}, {"meaning", "高效的；效率高的"}}
    };
    // 例句和同义词默认留空，由翻译引擎填充

    connect(m_translationManager, &TranslationManager::translationReady,
            this, &AppState::onTranslationReady);
    connect(m_translationManager, &TranslationManager::translationError,
            this, &AppState::onTranslationError);

    connect(m_mediaSession, &MediaSessionService::playbackStateChanged,
            this, &AppState::musicPlayingChanged);
    connect(m_mediaSession, &MediaSessionService::trackChanged,
            this, &AppState::musicTrackChanged);
    connect(m_mediaSession, &MediaSessionService::positionChanged,
            this, &AppState::musicPositionChanged);
    connect(m_mediaSession, &MediaSessionService::lyricChanged,
            this, &AppState::musicLyricChanged);

    m_copyTimer.setSingleShot(true);
    m_copyTimer.setInterval(1200);
    connect(&m_copyTimer, &QTimer::timeout, this, &AppState::resetJustCopied);

    m_minLoadTimer.setSingleShot(true);
    m_translateStartTime = 0;

    if (m_database->init()) {
        m_history = m_database->getHistory();
        m_favorites = m_database->getFavorites();
        emit historyChanged();
        emit favoritesChanged();
    }

    // 初始化离线词库
    QString appDir = QCoreApplication::applicationDirPath();
    QStringList possiblePaths = {
        appDir + "/data/stardict.db",
        appDir + "/../../data/stardict.db",
        appDir + "/../../../data/stardict.db",
        QDir::currentPath() + "/data/stardict.db"
    };

    QString dictPath;
    for (const QString &path : possiblePaths) {
        if (QFileInfo::exists(path)) {
            dictPath = path;
            break;
        }
    }

    if (dictPath.isEmpty()) {
        qWarning() << "Offline dictionary not found, searched:" << possiblePaths;
    } else {
        qDebug() << "Loading offline dictionary from:" << dictPath;
        if (m_offlineDict->init(dictPath)) {
            qDebug() << "Offline dictionary loaded successfully";
        } else {
            qWarning() << "Failed to load offline dictionary";
        }
    }

    connect(m_selectionManager, &SelectionManager::textSelected, this, [this](const QString &text) {
        if (!text.isEmpty()) {
            m_sourceText = text;
            emit sourceTextChanged();
            translate();
        }
    });
}

QString AppState::sourceText() const { return m_sourceText; }
void AppState::setSourceText(const QString &text)
{
    if (m_sourceText == text) return;
    m_sourceText = text;
    emit sourceTextChanged();
}

QString AppState::translatedText() const { return m_translatedText; }
QString AppState::sourceLang() const { return m_sourceLang; }
void AppState::setSourceLang(const QString &lang)
{
    if (m_sourceLang == lang) return;
    m_sourceLang = lang;
    emit sourceLangChanged();
}

QString AppState::targetLang() const { return m_targetLang; }
void AppState::setTargetLang(const QString &lang)
{
    if (m_targetLang == lang) return;
    m_targetLang = lang;
    emit targetLangChanged();
}

bool AppState::isTranslating() const { return m_isTranslating; }
bool AppState::isWord() const { return m_isWord; }
QString AppState::phoneticUs() const { return m_phoneticUs; }
QString AppState::phoneticUk() const { return m_phoneticUk; }
bool AppState::isFavorite() const { return m_isFavorite; }
void AppState::setIsFavorite(bool fav)
{
    if (m_isFavorite == fav) return;
    m_isFavorite = fav;
    emit isFavoriteChanged();
}

QString AppState::engine() const { return m_engine; }
void AppState::setEngine(const QString &e)
{
    if (m_engine == e) return;
    m_engine = e;
    m_translationManager->setEngine(e);
    emit engineChanged();
}

bool AppState::justCopied() const { return m_justCopied; }
bool AppState::isPinned() const { return m_isPinned; }
void AppState::setIsPinned(bool p) {
    if (m_isPinned == p) return;
    m_isPinned = p;
    emit isPinnedChanged();
}
bool AppState::compactMode() const { return m_compactMode; }
void AppState::setCompactMode(bool b)
{
    if (m_compactMode == b) return;
    m_compactMode = b;
    emit compactModeChanged();
}

bool AppState::selectionTranslation() const { return m_selectionTranslation; }
void AppState::setSelectionTranslation(bool b)
{
    if (m_selectionTranslation == b) return;
    m_selectionTranslation = b;
    emit selectionTranslationChanged();
}

QString AppState::selectionTriggerMode() const { return m_selectionTriggerMode; }
void AppState::setSelectionTriggerMode(const QString &mode)
{
    if (m_selectionTriggerMode == mode) return;
    m_selectionTriggerMode = mode;
    emit selectionTriggerModeChanged();
}

bool AppState::autoSpeak() const { return m_autoSpeak; }
void AppState::setAutoSpeak(bool b)
{
    if (m_autoSpeak == b) return;
    m_autoSpeak = b;
    emit autoSpeakChanged();
}

double AppState::cardOpacity() const { return m_cardOpacity; }
void AppState::setCardOpacity(double v)
{
    double clamped = qMax(0.6, qMin(1.0, v));
    if (qFuzzyCompare(m_cardOpacity, clamped)) return;
    m_cardOpacity = clamped;
    emit cardOpacityChanged();
}

int AppState::fontSizePercent() const { return m_fontSizePercent; }
void AppState::setFontSizePercent(int p)
{
    int clamped = qBound(50, p, 160);
    if (m_fontSizePercent == clamped) return;
    m_fontSizePercent = clamped;
    emit fontSizePercentChanged();
}

void AppState::resetFontSize()
{
    setFontSizePercent(100);
}

void AppState::clearText()
{
    setSourceText("");
}

QVariantList AppState::definitions() const { return m_definitions; }
QVariantList AppState::examples() const { return m_examples; }
QVariantList AppState::synonyms() const { return m_synonyms; }
QVariantList AppState::antonyms() const { return m_antonyms; }
QVariantList AppState::wordForms() const { return m_wordForms; }
QVariantList AppState::tags() const { return m_tags; }
QString AppState::englishDefinition() const { return m_englishDefinition; }
QVariantList AppState::history() const { return m_history; }
QVariantList AppState::favorites() const { return m_favorites; }

void AppState::translate()
{
    if (m_sourceText.trimmed().isEmpty()) return;

    m_isTranslating = true;
    emit isTranslatingChanged();
    clearResult();

    if (!m_errorMessage.isEmpty()) {
        m_errorMessage.clear();
        emit errorMessageChanged();
    }

    m_translateStartTime = QDateTime::currentMSecsSinceEpoch();

    // 如果选择了离线引擎，始终使用离线词库
    if (m_engine == "offline") {
        if (m_offlineDict->isAvailable() && m_sourceLang == "en") {
            QVariantMap dictResult = m_offlineDict->lookup(m_sourceText);
            if (dictResult.value("found", false).toBool()) {
                // 离线词库命中，构造完整结果
                QVariantMap result;
                result["translatedText"] = dictResult.value("briefTranslation").toString();
                result["isWord"] = true;
                result["phonetic"] = QVariantMap{
                    {"us", dictResult.value("phonetic").toString()},
                    {"uk", dictResult.value("phonetic").toString()}
                };
                result["definitions"] = dictResult.value("definitions").toList();
                result["wordForms"] = dictResult.value("wordForms").toList();
                result["englishDefinition"] = dictResult.value("englishDefinition").toString();
                result["tags"] = dictResult.value("tags").toList();
                result["collins"] = dictResult.value("collins").toInt();
                result["oxford"] = dictResult.value("oxford").toInt();
                result["examples"] = QVariantList();
                result["synonyms"] = QVariantList();
                result["antonyms"] = QVariantList();
                result["engine"] = "offline-dict";

                qint64 elapsed = QDateTime::currentMSecsSinceEpoch() - m_translateStartTime;
                if (elapsed < 300) {
                    QTimer::singleShot(300 - elapsed, this, [this, result]() {
                        m_pendingResult = result;
                        applyPendingResult();
                    });
                } else {
                    m_pendingResult = result;
                    applyPendingResult();
                }
                return;
            }
        }
        // 离线词库未命中或不支持该语言，返回原文
        QVariantMap result;
        result["translatedText"] = m_sourceText;
        result["isWord"] = false;
        result["engine"] = "offline";
        m_pendingResult = result;
        QTimer::singleShot(300, this, &AppState::applyPendingResult);
        return;
    }

    // 在线引擎：优先查离线词库（仅英文单词）
    if (m_offlineDict->isAvailable() && m_sourceLang == "en") {
        QVariantMap dictResult = m_offlineDict->lookup(m_sourceText);
        if (dictResult.value("found", false).toBool()) {
            // 离线词库命中，构造完整结果
            QVariantMap result;
            result["translatedText"] = dictResult.value("briefTranslation").toString();
            result["isWord"] = true;
            result["phonetic"] = QVariantMap{
                {"us", dictResult.value("phonetic").toString()},
                {"uk", dictResult.value("phonetic").toString()}
            };
            result["definitions"] = dictResult.value("definitions").toList();
            result["wordForms"] = dictResult.value("wordForms").toList();
            result["englishDefinition"] = dictResult.value("englishDefinition").toString();
            result["tags"] = dictResult.value("tags").toList();
            result["collins"] = dictResult.value("collins").toInt();
            result["oxford"] = dictResult.value("oxford").toInt();
            result["examples"] = QVariantList();
            result["synonyms"] = QVariantList();
            result["antonyms"] = QVariantList();
            result["engine"] = "offline-dict";

            qint64 elapsed = QDateTime::currentMSecsSinceEpoch() - m_translateStartTime;
            if (elapsed < 300) {
                QTimer::singleShot(300 - elapsed, this, [this, result]() {
                    m_pendingResult = result;
                    applyPendingResult();
                });
            } else {
                m_pendingResult = result;
                applyPendingResult();
            }
            return;
        }
    }

    // 离线词库未命中，走在线翻译
    m_translationManager->translate(m_sourceText, m_sourceLang, m_targetLang);
}

void AppState::onTranslationReady(const QVariantMap &result)
{
    m_pendingResult = result;
    m_pendingError.clear();

    qint64 elapsed = QDateTime::currentMSecsSinceEpoch() - m_translateStartTime;
    const qint64 minLoadTime = 500; // 最小加载时间，确保动画可见

    if (elapsed >= minLoadTime) {
        applyPendingResult();
    } else {
        QTimer::singleShot(minLoadTime - elapsed, this, &AppState::applyPendingResult);
    }
}

void AppState::applyPendingResult()
{
    m_isTranslating = false;
    emit isTranslatingChanged();

    if (!m_pendingError.isEmpty()) {
        TranslationManager::ErrorType type = TranslationManager::classifyError(m_pendingError);
        m_errorMessage = TranslationManager::userFriendlyError(type, m_pendingError);
        m_translatedText = m_errorMessage;
        emit errorMessageChanged();
        emit translatedTextChanged();
        qWarning() << "Translation error:" << m_pendingError;
        m_pendingError.clear();
        return;
    }

    QVariantMap result = m_pendingResult;
    m_pendingResult.clear();

    m_translatedText = result.value("translatedText").toString();
    m_isWord = result.value("isWord", false).toBool();

    if (result.contains("phonetic")) {
        QVariantMap phonetic = result.value("phonetic").toMap();
        m_phoneticUs = phonetic.value("us").toString();
        m_phoneticUk = phonetic.value("uk").toString();
    } else {
        m_phoneticUs.clear();
        m_phoneticUk.clear();
    }

    if (result.contains("definitions")) {
        m_definitions = result.value("definitions").toList();
    }
    if (result.contains("examples")) {
        m_examples = result.value("examples").toList();
    }
    if (result.contains("synonyms")) {
        m_synonyms = result.value("synonyms").toList();
    } else {
        m_synonyms.clear();
    }
    if (result.contains("antonyms")) {
        m_antonyms = result.value("antonyms").toList();
    } else {
        m_antonyms.clear();
    }
    if (result.contains("wordForms")) {
        m_wordForms = result.value("wordForms").toList();
    } else {
        m_wordForms.clear();
    }
    if (result.contains("tags")) {
        m_tags = result.value("tags").toList();
    } else {
        m_tags.clear();
    }
    if (result.contains("englishDefinition")) {
        m_englishDefinition = result.value("englishDefinition").toString();
    } else {
        m_englishDefinition.clear();
    }

    emit translatedTextChanged();
    emit isWordChanged();
    emit phoneticUsChanged();
    emit phoneticUkChanged();
    emit definitionsChanged();
    emit examplesChanged();
    emit synonymsChanged();
    emit antonymsChanged();
    emit wordFormsChanged();
    emit tagsChanged();
    emit englishDefinitionChanged();

    // 保存到历史记录
    m_database->addHistory(m_sourceText, m_translatedText, m_sourceLang, m_targetLang,
                           result.value("engine", m_engine).toString());
    m_history = m_database->getHistory();
    emit historyChanged();

    // 更新收藏状态
    m_isFavorite = m_database->isFavorite(m_sourceText);
    emit isFavoriteChanged();

    if (m_autoSpeak && !m_translatedText.isEmpty()) {
        speak(m_translatedText, m_targetLang);
    }
}

void AppState::onTranslationError(const QString &error)
{
    m_pendingError = error;
    m_pendingResult.clear();

    qint64 elapsed = QDateTime::currentMSecsSinceEpoch() - m_translateStartTime;
    const qint64 minLoadTime = 500;

    if (elapsed >= minLoadTime) {
        applyPendingResult();
    } else {
        QTimer::singleShot(minLoadTime - elapsed, this, &AppState::applyPendingResult);
    }
}

void AppState::clearResult()
{
    m_translatedText.clear();
    m_isWord = false;
    m_phoneticUs.clear();
    m_phoneticUk.clear();
    m_definitions.clear();
    m_examples.clear();
    m_synonyms.clear();
    m_antonyms.clear();
    m_wordForms.clear();
    m_tags.clear();
    m_englishDefinition.clear();
    emit translatedTextChanged();
    emit isWordChanged();
    emit phoneticUsChanged();
    emit phoneticUkChanged();
    emit definitionsChanged();
    emit examplesChanged();
    emit synonymsChanged();
    emit antonymsChanged();
    emit wordFormsChanged();
    emit tagsChanged();
    emit englishDefinitionChanged();
}

void AppState::swapLanguages()
{
    QString tmp = m_sourceLang;
    m_sourceLang = m_targetLang;
    m_targetLang = tmp;
    emit sourceLangChanged();
    emit targetLangChanged();
}

void AppState::copyTranslation()
{
    QGuiApplication::clipboard()->setText(m_translatedText);
    m_justCopied = true;
    emit justCopiedChanged();
    m_copyTimer.start();
}

void AppState::copySourceText()
{
    QGuiApplication::clipboard()->setText(m_sourceText);
}

void AppState::resetJustCopied()
{
    m_justCopied = false;
    emit justCopiedChanged();
}

void AppState::speak(const QString &text, const QString &lang, const QString &accent)
{
    QString targetText = text.trimmed();
    if (targetText.isEmpty()) {
        targetText = m_translatedText.trimmed().isEmpty() ? m_sourceText.trimmed() : m_translatedText.trimmed();
    }
    if (targetText.isEmpty()) return;

    QString targetLang = lang.trimmed().toLower();
    if (targetLang.isEmpty()) {
        targetLang = m_targetLang.trimmed().toLower();
        if (targetLang.isEmpty()) targetLang = "en";
    }

    QByteArray base64Text = targetText.toUtf8().toBase64();
    QString culturePrefix = (targetLang.startsWith("zh")) ? "zh" : "en";
    QString accentPreference = (accent == "uk") ? "en-GB" : "en-US";

    // 采用 Windows 原生 PowerShell System.Speech 并在异常时自动回退到 SAPI.SpVoice
    // 使用 Base64 编解码彻底规避中文字符集乱码、引号转义及换行截断问题
    QString psCommand = QString(
        "try { "
        "Add-Type -AssemblyName System.Speech; "
        "$s = New-Object System.Speech.Synthesis.SpeechSynthesizer; "
        "$b = [System.Convert]::FromBase64String('%1'); "
        "$t = [System.Text.Encoding]::UTF8.GetString($b); "
        "$voices = $s.GetInstalledVoices() | Where-Object { $_.Enabled }; "
        "if ('%2' -eq 'en-GB') { $v = $voices | Where-Object { $_.VoiceInfo.Culture.Name -like '*GB*' -or $_.VoiceInfo.Name -like '*Hazel*' -or $_.VoiceInfo.Name -like '*George*' } | Select-Object -First 1 } "
        "elseif ('%3' -eq 'zh') { $v = $voices | Where-Object { $_.VoiceInfo.Culture.Name -like '*CN*' -or $_.VoiceInfo.Culture.Name -like '*zh*' -or $_.VoiceInfo.Name -like '*Huihui*' -or $_.VoiceInfo.Name -like '*Yaoyao*' } | Select-Object -First 1 } "
        "else { $v = $voices | Where-Object { $_.VoiceInfo.Culture.Name -like '*US*' -or $_.VoiceInfo.Name -like '*Zira*' -or $_.VoiceInfo.Name -like '*David*' } | Select-Object -First 1 }; "
        "if ($v) { $s.SelectVoice($v.VoiceInfo.Name) }; "
        "$s.Rate = 0; "
        "$s.Speak($t); "
        "} catch { "
        "$v = New-Object -ComObject SAPI.SpVoice; "
        "$b = [System.Convert]::FromBase64String('%1'); "
        "$t = [System.Text.Encoding]::UTF8.GetString($b); "
        "$v.Speak($t); "
        "}"
    ).arg(QString::fromLatin1(base64Text), accentPreference, culturePrefix);

    QProcess::startDetached("powershell", QStringList()
        << "-NoProfile"
        << "-NonInteractive"
        << "-ExecutionPolicy" << "Bypass"
        << "-WindowStyle" << "Hidden"
        << "-Command" << psCommand
    );
}

void AppState::setApiKey(const QString &engine, const QString &key)
{
    m_translationManager->setApiKey(engine, key);
}

void AppState::setApiSecret(const QString &engine, const QString &secret)
{
    m_translationManager->setApiSecret(engine, secret);
}

void AppState::toggleFavorite()
{
    if (m_sourceText.isEmpty()) return;

    if (m_isFavorite) {
        // 取消收藏：找到并删除
        for (const QVariant &fav : m_favorites) {
            QVariantMap map = fav.toMap();
            if (map.value("sourceText").toString() == m_sourceText) {
                m_database->removeFavorite(map.value("id").toInt());
                break;
            }
        }
        m_isFavorite = false;
    } else {
        QString defs;
        for (const QVariant &def : m_definitions) {
            QVariantMap d = def.toMap();
            defs += d.value("partOfSpeech").toString() + " " + d.value("meaning").toString() + "; ";
        }
        m_database->addFavorite(m_sourceText, m_translatedText, m_sourceLang, m_targetLang,
                                m_phoneticUs, defs);
        m_isFavorite = true;
    }
    emit isFavoriteChanged();
    m_favorites = m_database->getFavorites();
    emit favoritesChanged();
}

void AppState::clearHistory()
{
    m_database->clearHistory();
    m_history.clear();
    emit historyChanged();
}

void AppState::deleteHistory(int id)
{
    m_database->deleteHistory(id);
    m_history = m_database->getHistory();
    emit historyChanged();
}

void AppState::refreshHistory()
{
    m_history = m_database->getHistory();
    emit historyChanged();
}

void AppState::refreshFavorites()
{
    m_favorites = m_database->getFavorites();
    emit favoritesChanged();
}

void AppState::triggerSelectionTranslation()
{
    m_selectionManager->setEnabled(m_selectionTranslation);
    m_selectionManager->triggerSelectionTranslation();
}

void AppState::clearError()
{
    if (!m_errorMessage.isEmpty()) {
        m_errorMessage.clear();
        emit errorMessageChanged();
    }
}

bool AppState::didCrashLastRun() const
{
    return CrashHandler::instance()->didCrashLastRun();
}

QString AppState::lastCrashInfo() const
{
    return CrashHandler::instance()->lastCrashInfo();
}

void AppState::dismissCrashWarning()
{
    CrashHandler::instance()->clearCrashFlag();
    emit crashInfoChanged();
}

QString AppState::completeTranslation() const
{
    if (m_isWord && !m_definitions.isEmpty()) {
        QStringList parts;
        for (const QVariant &defVar : m_definitions) {
            QVariantMap def = defVar.toMap();
            QString pos = def.value("partOfSpeech").toString();
            QString meaning = def.value("meaning").toString();
            if (!pos.isEmpty()) {
                parts.append(pos + " " + meaning);
            } else {
                parts.append(meaning);
            }
        }
        return parts.join("; ");
    }
    return m_translatedText;
}

bool AppState::musicPlaying() const
{
    return m_mediaSession ? m_mediaSession->isPlaying() : false;
}

QString AppState::trackTitle() const
{
    return m_mediaSession ? m_mediaSession->title() : QString();
}

QString AppState::trackArtist() const
{
    return m_mediaSession ? m_mediaSession->artist() : QString();
}

QString AppState::trackAlbum() const
{
    return m_mediaSession ? m_mediaSession->album() : QString();
}

int AppState::trackDuration() const
{
    return m_mediaSession ? m_mediaSession->durationSeconds() : 0;
}

int AppState::trackPosition() const
{
    return m_mediaSession ? m_mediaSession->positionSeconds() : 0;
}

QString AppState::currentLyric() const
{
    return m_mediaSession ? m_mediaSession->currentLyric() : QString();
}

QString AppState::currentLyricTranslation() const
{
    return m_mediaSession ? m_mediaSession->currentLyricTranslation() : QString();
}

void AppState::setPillMusicMode(bool enabled)
{
    if (m_pillMusicMode != enabled) {
        m_pillMusicMode = enabled;
        emit pillMusicModeChanged();
    }
}

void AppState::togglePillMusicMode()
{
    setPillMusicMode(!m_pillMusicMode);
}

void AppState::toggleMusicPlay()
{
    if (m_mediaSession) {
        m_mediaSession->togglePlay();
    }
}

void AppState::nextTrack()
{
    if (m_mediaSession) {
        m_mediaSession->next();
    }
}

void AppState::prevTrack()
{
    if (m_mediaSession) {
        m_mediaSession->previous();
    }
}

void AppState::seekTrack(int seconds)
{
    if (m_mediaSession) {
        m_mediaSession->seek(seconds);
    }
}

