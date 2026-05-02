# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# ============================================================
# Google Mobile Ads (AdMob)
# ============================================================
-keep class com.google.android.gms.ads.** { *; }
-keep class com.google.android.gms.common.** { *; }
-dontwarn com.google.android.gms.ads.**

# ============================================================
# Unity Ads + Unity Mediation Adapter
# ============================================================
-keep class com.unity3d.ads.** { *; }
-keep class com.unity3d.services.** { *; }
-keep class com.google.ads.mediation.unity.** { *; }
-dontwarn com.unity3d.**
-dontwarn com.google.ads.mediation.unity.**

# ============================================================
# InMobi SDK + InMobi Mediation Adapter
# ============================================================
-keep class com.inmobi.** { *; }
-keep class com.google.ads.mediation.inmobi.** { *; }
-dontwarn com.inmobi.**
-dontwarn com.google.ads.mediation.inmobi.**

# InMobi requires these
-keepattributes JavascriptInterface
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes InnerClasses,EnclosingMethod
-keep class com.squareup.picasso.** { *; }
-dontwarn com.squareup.picasso.**
-keep class com.google.android.gms.common.util.** { *; }
-keep class com.google.android.gms.ads.identifier.** { *; }

# ============================================================
# AndroidX / Kotlin (safety)
# ============================================================
-dontwarn org.jetbrains.annotations.**
-keep class kotlin.Metadata { *; }

# ============================================================
# Capacitor — keep plugin classes & JS bridge
# ============================================================
-keep class com.getcapacitor.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }
-keepclassmembers class * {
    @com.getcapacitor.PluginMethod public *;
}
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
