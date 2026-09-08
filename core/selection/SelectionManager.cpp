#include "SelectionManager.h"
#include <QGuiApplication>
#include <QClipboard>
#include <QDebug>

#ifdef Q_OS_WIN
#include <windows.h>
#endif

SelectionManager::SelectionManager(QObject *parent)
    : QObject(parent)
    , m_enabled(true)
    , m_previousSeq(0)
    , m_waitCount(0)
{
    m_clipboardTimer.setSingleShot(true);
    m_clipboardTimer.setInterval(50);
    connect(&m_clipboardTimer, &QTimer::timeout, this, [this]() {
        m_waitCount++;
        QString text = readClipboardText();
        quint32 currentSeq = 0;
#ifdef Q_OS_WIN
        currentSeq = (quint32)GetClipboardSequenceNumber();
#endif

        if (!text.isEmpty() && currentSeq != m_previousSeq) {
            emit textSelected(text);
            restoreClipboard(m_previousClipboard);
            return;
        }

        if (m_waitCount < 20) {
            m_clipboardTimer.start();
        } else {
            restoreClipboard(m_previousClipboard);
        }
    });
}

SelectionManager::~SelectionManager() = default;

void SelectionManager::setEnabled(bool enabled)
{
    m_enabled = enabled;
}

void SelectionManager::triggerSelectionTranslation()
{
    if (!m_enabled) return;

    m_previousClipboard = readClipboardText();
#ifdef Q_OS_WIN
    m_previousSeq = (quint32)GetClipboardSequenceNumber();
#endif
    m_waitCount = 0;

    simulateCopy();
    m_clipboardTimer.start();
}

void SelectionManager::simulateCopy()
{
#ifdef Q_OS_WIN
    INPUT inputs[4] = {};
    inputs[0].type = INPUT_KEYBOARD;
    inputs[0].ki.wVk = VK_CONTROL;
    inputs[1].type = INPUT_KEYBOARD;
    inputs[1].ki.wVk = 'C';
    inputs[2].type = INPUT_KEYBOARD;
    inputs[2].ki.wVk = 'C';
    inputs[2].ki.dwFlags = KEYEVENTF_KEYUP;
    inputs[3].type = INPUT_KEYBOARD;
    inputs[3].ki.wVk = VK_CONTROL;
    inputs[3].ki.dwFlags = KEYEVENTF_KEYUP;
    SendInput(4, inputs, sizeof(INPUT));
#endif
}

QString SelectionManager::readClipboardText()
{
    QClipboard *clipboard = QGuiApplication::clipboard();
    return clipboard->text();
}

void SelectionManager::restoreClipboard(const QString &previousText)
{
    QClipboard *clipboard = QGuiApplication::clipboard();
    clipboard->setText(previousText);
}
