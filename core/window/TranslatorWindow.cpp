#include "TranslatorWindow.h"

#include <QGuiApplication>
#include <QScreen>
#include <QQuickItem>
#include <QResizeEvent>
#include <QParallelAnimationGroup>

#ifdef Q_OS_WIN
#include <windows.h>
#include <dwmapi.h>

// === SetWindowCompositionAttribute (未文档化 API，用于 Acrylic 模糊) ===
typedef enum _ACCENT_STATE {
    ACCENT_DISABLED = 0,
    ACCENT_ENABLE_GRADIENT = 1,
    ACCENT_ENABLE_TRANSPARENTGRADIENT = 2,
    ACCENT_ENABLE_BLURBEHIND = 3,
    ACCENT_ENABLE_ACRYLICBLURBEHIND = 4,
    ACCENT_ENABLE_HOSTBACKDROP = 5,
    ACCENT_INVALID_STATE = 6
} ACCENT_STATE;

typedef struct _ACCENT_POLICY {
    ACCENT_STATE AccentState;
    DWORD AccentFlags;
    DWORD GradientColor;  // ABGR 格式
    DWORD AnimationId;
} ACCENT_POLICY;

typedef enum _WINDOWCOMPOSITIONATTRIB {
    WCA_UNDEFINED = 0,
    WCA_NCRENDERING_ENABLED = 1,
    WCA_NCRENDERING_POLICY = 2,
    WCA_TRANSITIONS_FORCEDISABLED = 3,
    WCA_ALLOW_NCPAINT = 4,
    WCA_CAPTION_BUTTON_BOUNDS = 5,
    WCA_NONCLIENT_RTL_LAYOUT = 6,
    WCA_FORCE_ICONIC_REPRESENTATION = 7,
    WCA_EXTENDED_FRAME_BOUNDS = 8,
    WCA_HAS_ICONIC_BITMAP = 9,
    WCA_THEME_ATTRIBUTES = 10,
    WCA_NCRENDERING_EXILED = 11,
    WCA_NCADORNMENTINFO = 12,
    WCA_EXCLUDED_FROM_LIVEPREVIEW = 13,
    WCA_VIDEO_OVERLAY_ACTIVE = 14,
    WCA_FORCE_ACTIVEWINDOW_APPEARANCE = 15,
    WCA_DISALLOW_PEEK = 16,
    WCA_CLOAK = 17,
    WCA_CLOAKED = 18,
    WCA_ACCENT_POLICY = 19,
    WCA_FREEZE_REPRESENTATION = 20,
    WCA_EVER_UNCLOAKED = 21,
    WCA_VISUAL_OWNER = 22,
    WCA_HOLOGRAPHIC = 23,
    WCA_EXCLUDED_FROM_DDA = 24,
    WCA_PASSIVEUPDATEMODE = 25,
    WCA_USEDARKMODECOLORS = 26,
    WCA_CORNER_STYLE = 27,
    WCA_PART_COLOR = 28,
    WCA_DISABLE_MOVESIZE_FEEDBACK = 29,
    WCA_LAST = 30
} WINDOWCOMPOSITIONATTRIB;

typedef struct _WINDOWCOMPOSITIONATTRIBDATA {
    WINDOWCOMPOSITIONATTRIB Attrib;
    PVOID pvData;
    SIZE_T cbData;
} WINDOWCOMPOSITIONATTRIBDATA;

typedef BOOL(WINAPI *PFN_SetWindowCompositionAttribute)(HWND, WINDOWCOMPOSITIONATTRIBDATA *);
#endif

TranslatorWindow::TranslatorWindow(QWindow *parent)
    : QQuickWindow(parent)
    , m_currentMode("pill")
    , m_isDragging(false)
    , m_pillWidth(380)
    , m_pillHeight(46)
    , m_cardWidth(380)
    , m_cardHeight(490)
    , m_dwmApplied(false)
    , m_widthAnim(new QPropertyAnimation(this, "width", this))
    , m_heightAnim(new QPropertyAnimation(this, "height", this))
{
    m_widthAnim->setEasingCurve(QEasingCurve::OutCubic);
    m_heightAnim->setEasingCurve(QEasingCurve::OutCubic);
    setupWindow();
}

TranslatorWindow::~TranslatorWindow() = default;

void TranslatorWindow::setupWindow()
{
    setFlag(Qt::FramelessWindowHint);
    setFlag(Qt::WindowStaysOnTopHint);
    setFlag(Qt::WindowDoesNotAcceptFocus, false);

    setColor(Qt::transparent);
    setWidth(m_pillWidth);
    setHeight(m_pillHeight);
    setMinimumWidth(160);
    setMinimumHeight(38);

    centerWindow();
}

void TranslatorWindow::centerWindow()
{
    auto screen = QGuiApplication::primaryScreen();
    if (!screen) return;
    auto geo = screen->availableGeometry();
    setPosition(geo.center().x() - m_pillWidth / 2, geo.center().y() - 200);
}

void TranslatorWindow::applyDwmBackdrop()
{
#ifdef Q_OS_WIN
    // 系统级模糊（DWM Acrylic / SetWindowCompositionAttribute）与 per-pixel alpha 圆角冲突
    // 用 QML 模拟毛玻璃质感，放弃系统级模糊
    m_dwmApplied = true;
#endif
}

void TranslatorWindow::exposeEvent(QExposeEvent *event)
{
    QQuickWindow::exposeEvent(event);
    if (isExposed() && !m_dwmApplied) {
        applyDwmBackdrop();
    }
}

void TranslatorWindow::resizeEvent(QResizeEvent *event)
{
    QQuickWindow::resizeEvent(event);
}

void TranslatorWindow::updateWindowRgn()
{
#ifdef Q_OS_WIN
    HWND hwnd = reinterpret_cast<HWND>(winId());
    if (!hwnd) return;

    int w = width();
    int h = height();
    // 药丸模式完全圆角（半径=高度一半），卡片模式 32px 圆角
    int radius = (m_currentMode == "pill") ? (h / 2) : 32;

    HRGN rgn = CreateRoundRectRgn(0, 0, w, h, radius * 2, radius * 2);
    if (rgn) {
        SetWindowRgn(hwnd, rgn, TRUE);
        // SetWindowRgn 接管 rgn 所有权，不需要 DeleteObject
    }
#endif
}

QString TranslatorWindow::currentMode() const { return m_currentMode; }

void TranslatorWindow::setCurrentMode(const QString &mode)
{
    if (m_currentMode == mode) return;
    m_currentMode = mode;
    emit currentModeChanged();

    if (mode == "pill") {
        setMinimumHeight(38);
        setMaximumHeight(60);
    } else {
        setMinimumHeight(95);
        setMaximumHeight(16777215);
    }
}

bool TranslatorWindow::isDragging() const { return m_isDragging; }

int TranslatorWindow::pillWidth() const { return m_pillWidth; }
void TranslatorWindow::setPillWidth(int w)
{
    if (m_pillWidth == w) return;
    m_pillWidth = w;
    emit pillWidthChanged();
}

int TranslatorWindow::pillHeight() const { return m_pillHeight; }
void TranslatorWindow::setPillHeight(int h)
{
    if (m_pillHeight == h) return;
    m_pillHeight = h;
    emit pillHeightChanged();
}

int TranslatorWindow::cardWidth() const { return m_cardWidth; }
void TranslatorWindow::setCardWidth(int w)
{
    if (m_cardWidth == w) return;
    m_cardWidth = w;
    emit cardWidthChanged();
}

int TranslatorWindow::cardHeight() const { return m_cardHeight; }
void TranslatorWindow::setCardHeight(int h)
{
    if (m_cardHeight == h) return;
    m_cardHeight = h;
    emit cardHeightChanged();
}

void TranslatorWindow::animateSize(int w, int h, int duration)
{
    m_widthAnim->stop();
    m_heightAnim->stop();
    m_widthAnim->setDuration(duration);
    m_heightAnim->setDuration(duration);
    m_widthAnim->setStartValue(width());
    m_heightAnim->setStartValue(height());
    m_widthAnim->setEndValue(w);
    m_heightAnim->setEndValue(h);
    m_widthAnim->start();
    m_heightAnim->start();
}

void TranslatorWindow::toggleMode()
{
    if (m_currentMode == "pill") {
        expandToCard();
    } else {
        collapseToPill();
    }
}

void TranslatorWindow::expandToCard()
{
    // Web 端逻辑：展开时保持当前宽度（至少380），高度设为490
    int targetWidth = qMax(width(), 380);
    int targetHeight = 490;

    m_cardWidth = targetWidth;
    m_cardHeight = targetHeight;

    QPoint pos = position();
    setCurrentMode("card");
    animateSize(targetWidth, targetHeight, 280);
    setPosition(pos);
}

void TranslatorWindow::collapseToPill()
{
    // Web 端逻辑：收起时保持当前宽度（至少160），高度设为46
    int targetWidth = qMax(width(), 160);
    int targetHeight = 46;

    m_pillWidth = targetWidth;
    m_pillHeight = targetHeight;

    QPoint pos = position();
    setCurrentMode("pill");
    animateSize(targetWidth, targetHeight, 250);
    setPosition(pos);
}

void TranslatorWindow::minimizeToTaskbar()
{
    // 最小化到任务栏：先移除 AlwaysOnTop，避免 frameless 窗口最小化崩溃
    setFlag(Qt::WindowStaysOnTopHint, false);
    showMinimized();
    // 恢复时重新设置 AlwaysOnTop
    connect(this, &QQuickWindow::windowStateChanged, this, [this](Qt::WindowStates state) {
        if (state != Qt::WindowMinimized) {
            setFlag(Qt::WindowStaysOnTopHint, true);
            disconnect(this, &QQuickWindow::windowStateChanged, this, nullptr);
        }
    });
}

void TranslatorWindow::setContentItem(QQuickItem *item)
{
    if (!item) return;
    item->setParentItem(contentItem());
    item->setWidth(width());
    item->setHeight(height());

    // 窗口尺寸变化时同步内容项
    connect(this, &QQuickWindow::widthChanged, item, [item, this]() {
        item->setWidth(width());
    });
    connect(this, &QQuickWindow::heightChanged, item, [item, this]() {
        item->setHeight(height());
    });
}

void TranslatorWindow::adjustHeightToContent(int contentHeight)
{
    if (m_currentMode != "card") return;
    if (contentHeight <= 0) return;

    // 限制最小和最大高度
    int minH = 200;
    int maxH = 800;
    int targetH = qBound(minH, contentHeight, maxH);

    // 如果当前高度已经接近目标高度，不调整
    if (qAbs(height() - targetH) < 10) return;

    // 动画调整高度
    animateSize(width(), targetH, 250);
}
