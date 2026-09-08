#pragma once

#include <QQuickWindow>
#include <QPropertyAnimation>

class TranslatorWindow : public QQuickWindow
{
    Q_OBJECT
    Q_PROPERTY(QString currentMode READ currentMode WRITE setCurrentMode NOTIFY currentModeChanged)
    Q_PROPERTY(bool isDragging READ isDragging NOTIFY isDraggingChanged)
    Q_PROPERTY(int pillWidth READ pillWidth WRITE setPillWidth NOTIFY pillWidthChanged)
    Q_PROPERTY(int pillHeight READ pillHeight WRITE setPillHeight NOTIFY pillHeightChanged)
    Q_PROPERTY(int cardWidth READ cardWidth WRITE setCardWidth NOTIFY cardWidthChanged)
    Q_PROPERTY(int cardHeight READ cardHeight WRITE setCardHeight NOTIFY cardHeightChanged)

public:
    explicit TranslatorWindow(QWindow *parent = nullptr);
    ~TranslatorWindow() override;

    QString currentMode() const;
    void setCurrentMode(const QString &mode);
    bool isDragging() const;

    int pillWidth() const;
    void setPillWidth(int w);
    int pillHeight() const;
    void setPillHeight(int h);
    int cardWidth() const;
    void setCardWidth(int w);
    int cardHeight() const;
    void setCardHeight(int h);

    Q_INVOKABLE void toggleMode();
    Q_INVOKABLE void expandToCard();
    Q_INVOKABLE void collapseToPill();
    Q_INVOKABLE void minimizeToTaskbar();
    Q_INVOKABLE void setContentItem(QQuickItem *item);
    Q_INVOKABLE void animateSize(int w, int h, int duration = 250);
    Q_INVOKABLE void adjustHeightToContent(int contentHeight);

signals:
    void currentModeChanged();
    void isDraggingChanged();
    void pillWidthChanged();
    void pillHeightChanged();
    void cardWidthChanged();
    void cardHeightChanged();

protected:
    void exposeEvent(QExposeEvent *event) override;
    void resizeEvent(QResizeEvent *event) override;

private:
    void setupWindow();
    void applyDwmBackdrop();
    void centerWindow();
    void updateWindowRgn();

    QString m_currentMode;
    bool m_isDragging;
    int m_pillWidth;
    int m_pillHeight;
    int m_cardWidth;
    int m_cardHeight;
    bool m_dwmApplied;
    QPropertyAnimation *m_widthAnim;
    QPropertyAnimation *m_heightAnim;
};
