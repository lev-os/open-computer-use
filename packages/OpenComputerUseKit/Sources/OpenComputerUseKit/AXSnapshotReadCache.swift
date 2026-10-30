import ApplicationServices
import Foundation

/// Only the renderer enters this scope. Action reads and later snapshots stay fresh.
final class AXSnapshotReadCache: NSObject {
    private struct ElementKey: Hashable {
        let element: AXUIElement
        static func == (lhs: Self, rhs: Self) -> Bool { CFEqual(lhs.element, rhs.element) }
        func hash(into hasher: inout Hasher) { hasher.combine(CFHash(element)) }
    }
    enum Attribute {
        case value(CFTypeRef)
        case absent
        var value: CFTypeRef? { if case .value(let value) = self { return value }; return nil }
    }
    static let key = "OpenComputerUse.AXSnapshotReadCache"
    static var current: AXSnapshotReadCache? { Thread.current.threadDictionary[key] as? AXSnapshotReadCache }
    private var attributes: [ElementKey: [String: Attribute]] = [:]
    private var prefetched: Set<ElementKey> = []
    private var actions: [ElementKey: [String]] = [:]
    private var settable: [ElementKey: [String: Bool]] = [:]
    let batch: (AXUIElement) -> [String: Attribute]
    let single: (AXUIElement, String) -> (AXError, CFTypeRef?)

    init(batch: @escaping (AXUIElement) -> [String: Attribute] = readBatch,
         single: @escaping (AXUIElement, String) -> (AXError, CFTypeRef?) = readSingle) {
        self.batch = batch; self.single = single
    }

    static func withSnapshot<T>(_ body: () throws -> T) rethrows -> T {
        let dictionary = Thread.current.threadDictionary
        let previous = dictionary[key]
        dictionary[key] = ProcessInfo.processInfo.environment["OPEN_COMPUTER_USE_DISABLE_AX_READ_CACHE"] == "1"
            ? nil : AXSnapshotReadCache()
        defer { dictionary[key] = previous }
        return try body()
    }

    func value(_ element: AXUIElement, _ name: String) -> CFTypeRef? {
        let key = ElementKey(element: element)
        if prefetched.insert(key).inserted { attributes[key] = batch(element) }
        if let cached = attributes[key]?[name] { return cached.value }
        let (error, value) = single(element, name)
        if error == .success, let value { attributes[key, default: [:]][name] = .value(value); return value }
        if error == .attributeUnsupported || error == .noValue { attributes[key, default: [:]][name] = .absent }
        return nil // Transient errors are not retained.
    }

    func actionNames(_ element: AXUIElement) -> [String]? {
        let key = ElementKey(element: element)
        if let cached = actions[key] { return cached }
        var raw: CFArray?
        let error = AXReadStatistics.measure("actions") { AXUIElementCopyActionNames(element, &raw) }
        if error == .success { let names = raw as? [String] ?? []; actions[key] = names; return names }
        return nil
    }

    func isSettable(_ element: AXUIElement, _ name: String) -> Bool {
        let key = ElementKey(element: element)
        if let cached = settable[key]?[name] { return cached }
        var flag = DarwinBoolean(false)
        let error = AXReadStatistics.measure("settable") { AXUIElementIsAttributeSettable(element, name as CFString, &flag) }
        let result = error == .success && flag.boolValue
        if error == .success || error == .attributeUnsupported { settable[key, default: [:]][name] = result }
        return result
    }

    private static let names = [
        "AXRole", "AXSubrole", "AXRoleDescription", "AXTitle", "AXDescription", "AXHelp", "AXValue",
        "AXIdentifier", "AXSelected", "AXExpanded", "AXEnabled", "AXPlaceholderValue", "AXPlaceholder",
        "AXPosition", "AXSize", "AXURL", "AXChildren", "AXRows", "AXVisibleChildren", "AXContents",
    ]

    private static func readSingle(_ element: AXUIElement, _ name: String) -> (AXError, CFTypeRef?) {
        var value: CFTypeRef?
        let error = AXReadStatistics.measure("attribute") { AXUIElementCopyAttributeValue(element, name as CFString, &value) }
        return (error, value)
    }

    private static func readBatch(_ element: AXUIElement) -> [String: Attribute] {
        var values: CFArray?
        let error = AXReadStatistics.measure("batch") {
            AXUIElementCopyMultipleAttributeValues(element, names as CFArray, AXCopyMultipleAttributeOptions(), &values)
        }
        guard error == .success, let raw = values as? [AnyObject], raw.count == names.count else { return [:] }
        var result: [String: Attribute] = [:]
        for (name, value) in zip(names, raw) {
            if CFGetTypeID(value) == AXValueGetTypeID(), AXValueGetType(value as! AXValue) == .axError {
                var failure = AXError.failure
                if AXValueGetValue(value as! AXValue, .axError, &failure), failure == .attributeUnsupported || failure == .noValue {
                    result[name] = .absent
                }
            } else if !(value is NSNull) { result[name] = .value(value) }
        }
        return result
    }
}
