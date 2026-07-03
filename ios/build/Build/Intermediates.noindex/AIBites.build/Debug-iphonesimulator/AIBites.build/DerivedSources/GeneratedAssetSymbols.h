#import <Foundation/Foundation.h>

#if __has_attribute(swift_private)
#define AC_SWIFT_PRIVATE __attribute__((swift_private))
#else
#define AC_SWIFT_PRIVATE
#endif

/// The resource bundle ID.
static NSString * const ACBundleID AC_SWIFT_PRIVATE = @"com.aibites.app";

/// The "AccentColor" asset catalog color resource.
static NSString * const ACColorNameAccentColor AC_SWIFT_PRIVATE = @"AccentColor";

/// The "celebrate" asset catalog image resource.
static NSString * const ACImageNameCelebrate AC_SWIFT_PRIVATE = @"celebrate";

/// The "celebrate-blink" asset catalog image resource.
static NSString * const ACImageNameCelebrateBlink AC_SWIFT_PRIVATE = @"celebrate-blink";

/// The "google-g" asset catalog image resource.
static NSString * const ACImageNameGoogleG AC_SWIFT_PRIVATE = @"google-g";

/// The "logo" asset catalog image resource.
static NSString * const ACImageNameLogo AC_SWIFT_PRIVATE = @"logo";

/// The "sad" asset catalog image resource.
static NSString * const ACImageNameSad AC_SWIFT_PRIVATE = @"sad";

/// The "sad-blink" asset catalog image resource.
static NSString * const ACImageNameSadBlink AC_SWIFT_PRIVATE = @"sad-blink";

/// The "talking" asset catalog image resource.
static NSString * const ACImageNameTalking AC_SWIFT_PRIVATE = @"talking";

/// The "talking-blink" asset catalog image resource.
static NSString * const ACImageNameTalkingBlink AC_SWIFT_PRIVATE = @"talking-blink";

/// The "thinking" asset catalog image resource.
static NSString * const ACImageNameThinking AC_SWIFT_PRIVATE = @"thinking";

/// The "thinking-blink" asset catalog image resource.
static NSString * const ACImageNameThinkingBlink AC_SWIFT_PRIVATE = @"thinking-blink";

/// The "wave" asset catalog image resource.
static NSString * const ACImageNameWave AC_SWIFT_PRIVATE = @"wave";

/// The "wave-blink" asset catalog image resource.
static NSString * const ACImageNameWaveBlink AC_SWIFT_PRIVATE = @"wave-blink";

#undef AC_SWIFT_PRIVATE
