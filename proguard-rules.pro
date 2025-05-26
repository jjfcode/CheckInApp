# Keep React Native specific classes
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# Keep Expo modules
-keep class expo.modules.** { *; }

# Keep your app-specific classes that you want to remain unobfuscated
-keep class com.juanjo73.CheckInApp.** { *; }

# Keep JavaScript interface method names
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod *;
    @com.facebook.react.bridge.ReactProp *;
}

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep any classes referenced from AndroidManifest.xml
-keepclassmembers class * {
    public <init>(android.content.Context, android.util.AttributeSet);
}

# Keep the annotation-related classes
-keep class androidx.annotation.** { *; }

# Specific shrinking/optimization rules for React Native
-dontwarn com.facebook.react.**
-dontwarn org.mozilla.javascript.**
-dontwarn org.mozilla.classfile.**
-dontwarn com.facebook.flipper.**
-dontwarn com.facebook.fbreact.**
-dontwarn com.facebook.fresco.**
-dontwarn javax.**
-dontwarn org.webrtc.**
-dontwarn org.consciousJSCore.**
-dontwarn android.support.**
