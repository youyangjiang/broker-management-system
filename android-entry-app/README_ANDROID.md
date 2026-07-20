# 华康医护安卓入口 App 打包说明

这个目录是“华康医护”的 Android 入口 App。App 安装后会直接打开线上系统：

https://hearty-alignment-production-2294.up.railway.app/login

## 方式一：用 Android Studio 打包 APK

1. 安装 Android Studio。
2. 打开 Android Studio，选择 `Open`。
3. 选择本目录：`android-entry-app`。
4. 等待 Gradle 同步完成。
5. 点击菜单 `Build` -> `Build Bundle(s) / APK(s)` -> `Build APK(s)`。
6. 生成的 APK 通常在：
   `android-entry-app/app/build/outputs/apk/debug/app-debug.apk`

## 手机安装

把 APK 发到安卓手机，打开安装即可。第一次安装非应用商店 APK 时，手机可能会提示允许“安装未知应用”，按提示允许即可。

## 修改入口网址

如果以后线上网址变了，修改：

`app/src/main/java/com/huakan/saude/MainActivity.java`

里面的：

```java
private static final String APP_URL = "https://hearty-alignment-production-2294.up.railway.app/login";
```

然后重新打包 APK。
