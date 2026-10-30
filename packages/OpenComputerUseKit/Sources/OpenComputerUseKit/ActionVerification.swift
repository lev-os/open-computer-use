import ApplicationServices
import Foundation

func actionValueMatches(_ observed: Any?, requested: String) -> Bool {
    if let text = observed as? String { return text.utf16.elementsEqual(requested.utf16) }
    if let number = observed as? NSNumber, let expected = Double(requested), expected.isFinite {
        return number.doubleValue == expected
    }
    return false
}

/// Validate custody before and after mutation. An AX success code alone does not
/// prove an application accepted a value. The same check runs with read-back off.
func applyVerifiedActionValue(_ requested: String, timeout: TimeInterval = 0.2,
                              validate: () throws -> Void, write: () throws -> Void,
                              read: () -> Any?) throws {
    try validate()
    try write()
    let deadline = ProcessInfo.processInfo.systemUptime + timeout
    repeat {
        try validate()
        if actionValueMatches(read(), requested: requested) { return }
        if ProcessInfo.processInfo.systemUptime >= deadline { break }
        Thread.sleep(forTimeInterval: 0.005)
    } while true
    throw ComputerUseError.stateUnavailable("set_value could not verify the requested value; the app ignored, changed or refused the write")
}

func requireActionTarget(_ element: AXUIElement, in snapshot: AppSnapshot) throws {
    try requireUsableComputerUseSession()
    var pid: pid_t = 0
    guard AXUIElementGetPid(element, &pid) == .success, pid == snapshot.app.pid,
          let window = snapshot.windowElement else {
        throw ComputerUseError.stateUnavailable("Action target no longer belongs to its captured app/window; refresh app state")
    }
    if CFEqual(element, window) { return }
    var owner: CFTypeRef?
    guard AXUIElementCopyAttributeValue(element, kAXWindowAttribute as CFString, &owner) == .success,
          let owner, CFEqual(owner, window) else {
        throw ComputerUseError.stateUnavailable("Action target moved to another window; refresh app state")
    }
}

private func actionScalar(_ value: CFTypeRef?) -> String? {
    guard let value else { return nil }
    if let text = value as? String { return text }
    if let number = value as? NSNumber { return number.stringValue }
    guard CFGetTypeID(value) == AXValueGetTypeID() else { return nil }
    let ax = value as! AXValue
    switch AXValueGetType(ax) {
    case .cgPoint:
        var point = CGPoint.zero
        return AXValueGetValue(ax, .cgPoint, &point) ? "\(point.x),\(point.y)" : nil
    case .cgSize:
        var size = CGSize.zero
        return AXValueGetValue(ax, .cgSize, &size) ? "\(size.width),\(size.height)" : nil
    default: return nil
    }
}

/// Read cached handles only, never walk AXChildren or capture a screenshot.
/// Missing observables fail verification rather than pretending the input worked.
func actionObservedValues(_ snapshot: AppSnapshot, scrollOnly: Bool = false) -> [String: String] {
    var values: [String: String] = [:]
    let records = snapshot.elements.values.sorted { $0.index < $1.index }.filter {
        !scrollOnly || ["AXScrollBar", "AXValueIndicator", "AXScrollArea"].contains($0.role ?? "")
    }.prefix(128)
    for record in records {
        guard let element = record.element else { continue }
        var value: CFTypeRef?
        if AXUIElementCopyAttributeValue(element, kAXValueAttribute as CFString, &value) == .success,
           let scalar = actionScalar(value) { values["\(record.index).value"] = scalar }
    }
    if !scrollOnly, let window = snapshot.windowElement {
        for attribute in [kAXPositionAttribute, kAXSizeAttribute] {
            var value: CFTypeRef?
            if AXUIElementCopyAttributeValue(window, attribute as CFString, &value) == .success,
               let scalar = actionScalar(value) { values[attribute] = scalar }
        }
    }
    return values
}

func requireObservedActionChange(_ name: String, before: [String: String],
                                 timeout: TimeInterval = 0.2,
                                 validate: () throws -> Void, read: () -> [String: String]) throws {
    let deadline = ProcessInfo.processInfo.systemUptime + timeout
    repeat {
        try validate()
        let after = read()
        // An unreadable target is not evidence of a successful change.
        if before.contains(where: { key, value in after[key].map { $0 != value } ?? false }) { return }
        if ProcessInfo.processInfo.systemUptime >= deadline { break }
        Thread.sleep(forTimeInterval: 0.005)
    } while true
    throw ComputerUseError.stateUnavailable("\(name) delivered input but no observable accessibility value or window geometry change was verified; the target may be at a boundary or ignore this input")
}
