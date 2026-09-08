cmake_minimum_required(VERSION 3.16)
project(lingust VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)

find_package(Qt6 6.5 REQUIRED COMPONENTS
    Core
    Gui
    Qml
    Quick
    QuickControls2
    Network
    Sql
    Widgets
)

qt_standard_project_setup(REQUIRES 6.5)
qt_policy(SET QTP0004 NEW)

# 显式标记 DesignTokens 为 QML Singleton（QTP0004 自动生成可能漏识别）
set_source_files_properties(ui/components/DesignTokens.qml PROPERTIES QT_QML_SINGLETON TRUE)

set(SOURCES
    app/main.cpp
    app/Application.cpp
    app/Application.h
    core/state/AppState.cpp
    core/state/AppState.h
    core/window/TranslatorWindow.cpp
    core/window/TranslatorWindow.h
    core/translation/TranslationManager.cpp
    core/translation/TranslationManager.h
    core/translation/OfflineDictionary.cpp
    core/translation/OfflineDictionary.h
    providers/ITranslationProvider.h
    providers/gemini/GeminiProvider.cpp
    providers/gemini/GeminiProvider.h
    providers/deepl/DeepLProvider.cpp
    providers/deepl/DeepLProvider.h
    providers/youdao/YoudaoProvider.cpp
    providers/youdao/YoudaoProvider.h
    infrastructure/database/DatabaseManager.cpp
    infrastructure/database/DatabaseManager.h
    infrastructure/crash/CrashHandler.cpp
    infrastructure/crash/CrashHandler.h
    infrastructure/crash/SafeExecutor.cpp
    infrastructure/crash/SafeExecutor.h
    core/selection/SelectionManager.cpp
    core/selection/SelectionManager.h
    core/window/TrayManager.cpp
    core/window/TrayManager.h
    core/capture/CaptureManager.cpp
    core/capture/CaptureManager.h
    core/ocr/OcrManager.cpp
    core/ocr/OcrManager.h
    core/media/MediaSessionService.cpp
    core/media/MediaSessionService.h
    providers/ocr/IOcrProvider.h
    platform/windows/hotkey/HotkeyManager.cpp
    platform/windows/hotkey/HotkeyManager.h
    platform/windows/mousehook/MouseHookManager.cpp
    platform/windows/mousehook/MouseHookManager.h
    platform/windows/media/WindowsMediaManager.cpp
    platform/windows/media/WindowsMediaManager.h
)

qt_add_executable(lingust ${SOURCES})

qt_add_qml_module(lingust
    URI Linguist
    VERSION 1.0
    QML_FILES
        ui/Main.qml
        ui/components/GlassSurface.qml
        ui/components/TrafficLights.qml
        ui/components/HoverScrollText.qml
        ui/components/MarqueeText.qml
        ui/components/IconButton.qml
        ui/components/LanguageSelector.qml
        ui/pill/PillView.qml
        ui/pill/MusicIslandCard.qml
        ui/card/CardView.qml
        ui/card/WordDetailView.qml
        ui/card/SearchInput.qml
        ui/card/HistoryView.qml
        ui/card/ScreenshotTranslationView.qml
        ui/settings/SettingsView.qml
    RESOURCES
        ui/components/DesignTokens.qml
        resources/icons/crop.svg
        resources/icons/camera.svg
        resources/icons/pin.svg
        resources/icons/settings.svg
        resources/icons/sliders.svg
        resources/icons/volume.svg
        resources/icons/copy.svg
        resources/icons/check.svg
        resources/icons/search.svg
        resources/icons/close.svg
        resources/icons/maximize.svg
        resources/icons/heart.svg
        resources/icons/history.svg
        resources/icons/swap.svg
        resources/icons/sparkles.svg
        resources/icons/type.svg
        resources/icons/plus.svg
        resources/icons/minus.svg
        resources/icons/eye.svg
        resources/icons/eye-off.svg
        resources/icons/external-link.svg
        resources/icons/rotate-ccw.svg
        resources/icons/music.svg
        resources/icons/play.svg
        resources/icons/pause.svg
        resources/icons/skip-back.svg
        resources/icons/skip-forward.svg
        resources/icons/disc.svg
)

target_link_libraries(lingust PRIVATE
    Qt6::Core
    Qt6::Gui
    Qt6::Qml
    Qt6::Quick
    Qt6::QuickControls2
    Qt6::Network
    Qt6::Sql
    Qt6::Widgets
)

if(WIN32)
    target_link_libraries(lingust PRIVATE dwmapi)
    target_compile_definitions(lingust PRIVATE WIN32_LEAN_AND_MEAN NOMINMAX UNICODE _UNICODE)

    if(MSVC)
        # MSVC: UTF-8 源码/执行字符集 + 标准 C++ 宏 + 合理警告级别
        target_compile_options(lingust PRIVATE /utf-8 /Zc:__cplusplus /W3 /permissive-)
        # Release: O2 优化; Debug: /Zi 调试信息
        target_compile_options(lingust PRIVATE $<$<CONFIG:Release>:/O2> $<$<CONFIG:Debug>:/Zi>)
    endif()
endif()

# 输出目录
set_target_properties(lingust PROPERTIES
    WIN32_EXECUTABLE FALSE
    MACOSX_BUNDLE TRUE
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/bin"
    LIBRARY_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/lib"
    ARCHIVE_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/lib"
)
