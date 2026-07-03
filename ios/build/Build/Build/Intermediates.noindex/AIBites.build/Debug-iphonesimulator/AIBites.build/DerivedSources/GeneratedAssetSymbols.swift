import Foundation
#if canImport(DeveloperToolsSupport)
import DeveloperToolsSupport
#endif

#if SWIFT_PACKAGE
private let resourceBundle = Foundation.Bundle.module
#else
private class ResourceBundleClass {}
private let resourceBundle = Foundation.Bundle(for: ResourceBundleClass.self)
#endif

// MARK: - Color Symbols -

@available(iOS 17.0, macOS 14.0, tvOS 17.0, watchOS 10.0, *)
extension DeveloperToolsSupport.ColorResource {

    /// The "AccentColor" asset catalog color resource.
    static let accent = DeveloperToolsSupport.ColorResource(name: "AccentColor", bundle: resourceBundle)

}

// MARK: - Image Symbols -

@available(iOS 17.0, macOS 14.0, tvOS 17.0, watchOS 10.0, *)
extension DeveloperToolsSupport.ImageResource {

    /// The "celebrate" asset catalog image resource.
    static let celebrate = DeveloperToolsSupport.ImageResource(name: "celebrate", bundle: resourceBundle)

    /// The "celebrate-blink" asset catalog image resource.
    static let celebrateBlink = DeveloperToolsSupport.ImageResource(name: "celebrate-blink", bundle: resourceBundle)

    /// The "google-g" asset catalog image resource.
    static let googleG = DeveloperToolsSupport.ImageResource(name: "google-g", bundle: resourceBundle)

    /// The "logo" asset catalog image resource.
    static let logo = DeveloperToolsSupport.ImageResource(name: "logo", bundle: resourceBundle)

    /// The "sad" asset catalog image resource.
    static let sad = DeveloperToolsSupport.ImageResource(name: "sad", bundle: resourceBundle)

    /// The "sad-blink" asset catalog image resource.
    static let sadBlink = DeveloperToolsSupport.ImageResource(name: "sad-blink", bundle: resourceBundle)

    /// The "talking" asset catalog image resource.
    static let talking = DeveloperToolsSupport.ImageResource(name: "talking", bundle: resourceBundle)

    /// The "talking-blink" asset catalog image resource.
    static let talkingBlink = DeveloperToolsSupport.ImageResource(name: "talking-blink", bundle: resourceBundle)

    /// The "thinking" asset catalog image resource.
    static let thinking = DeveloperToolsSupport.ImageResource(name: "thinking", bundle: resourceBundle)

    /// The "thinking-blink" asset catalog image resource.
    static let thinkingBlink = DeveloperToolsSupport.ImageResource(name: "thinking-blink", bundle: resourceBundle)

    /// The "wave" asset catalog image resource.
    static let wave = DeveloperToolsSupport.ImageResource(name: "wave", bundle: resourceBundle)

    /// The "wave-blink" asset catalog image resource.
    static let waveBlink = DeveloperToolsSupport.ImageResource(name: "wave-blink", bundle: resourceBundle)

}

