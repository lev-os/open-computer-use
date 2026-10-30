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
    let started = TimingLog.now()
    var polls = 0
    defer { TimingLog.log("action.verify_value.polls.\(polls)", since: started) }
    try validate()
    try write()
    let deadline = ProcessInfo.processInfo.systemUptime + timeout
    repeat {
        polls += 1
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

@discardableResult
func requireObservedActionChange(_ name: String, before: [String: String],
                                 timeout: TimeInterval = 0.2,
                                 validate: () throws -> Void, read: () -> [String: String]) throws -> [String: String] {
    let deadline = ProcessInfo.processInfo.systemUptime + timeout
    repeat {
        try validate()
        let after = read()
        // An unreadable target is not evidence of a successful change.
        if before.contains(where: { key, value in after[key].map { $0 != value } ?? false }) { return after }
        if ProcessInfo.processInfo.systemUptime >= deadline { break }
        Thread.sleep(forTimeInterval: 0.005)
    } while true
    throw ComputerUseError.stateUnavailable("\(name) delivered input but no observable accessibility value or window geometry change was verified; the target may be at a boundary or ignore this input")
}

/// Default action read-back uses a fixed number of existing handles. It does not
/// reindex the tree or capture a screenshot. Changes are relative to the last
/// explicit snapshot; callers request a full read when structure changes.
func boundedActionResult(_ snapshot: AppSnapshot) throws -> ToolCallResult {
    var lines = ["App=\(snapshot.app.bundleIdentifier ?? snapshot.app.name) (pid \(snapshot.app.pid))",
                 "Bounded action state; cached value changes from the last explicit snapshot:"]
    if snapshot.mode == .fixture {
        guard let state = try FixtureBridge.readState() else {
            throw ComputerUseError.stateUnavailable("Fixture state is no longer available")
        }
        for current in state.elements {
            if let value = current.value, value != snapshot.elements[current.index]?.value {
                lines.append("\(current.index) \(current.role) ID: \(current.identifier), Value: \(String(value.prefix(200)))")
            }
        }
        lines.append("Focused identifier: \(state.focusedIdentifier ?? "none")")
    } else {
        try requireUsableComputerUseSession()
        for record in snapshot.elements.values.sorted(by: { $0.index < $1.index }).prefix(12) {
            guard let element = record.element else { continue }
            var value: CFTypeRef?
            guard AXUIElementCopyAttributeValue(element, kAXValueAttribute as CFString, &value) == .success,
                  let scalar = actionScalar(value), scalar != (record.value ?? record.title) else { continue }
            lines.append("\(record.index) \(record.role ?? "element") ID: \(record.identifier ?? ""), Value: \(String(scalar.prefix(200)))")
        }
        var value: CFTypeRef?
        if AXUIElementCopyAttributeValue(AXUIElementCreateApplication(snapshot.app.pid), kAXFocusedUIElementAttribute as CFString, &value) == .success,
           let value, CFGetTypeID(value) == AXUIElementGetTypeID() {
            let focused = value as! AXUIElement
            try requireActionTarget(focused, in: snapshot)
            if let record = snapshot.elements.values.first(where: { $0.element.map { CFEqual($0, focused) } ?? false }) {
                lines.append("The focused UI element is \(record.index) \(record.role ?? "element").")
            }
            var focusedValue: CFTypeRef?
            if AXUIElementCopyAttributeValue(focused, kAXValueAttribute as CFString, &focusedValue) == .success,
               let scalar = actionScalar(focusedValue) {
                lines.append("Focused value: \(String(scalar.prefix(200)).debugDescription)")
            }
            if let range = AccessibilityTextSelection.readRange(of: focused) {
                lines.append("Selected UTF-16 range: \(range.location),\(range.length)")
            }
        }
    }
    lines.append("No tree walk or screenshot. Request get_app_state for new elements or changed layout.")
    return .text(lines.joined(separator: "\n"))
}

/// Keyboard actions must observe current focus after a bounded prior action,
/// rather than reuse the focused element from an older full snapshot.
func actionFocusedElement(_ snapshot: AppSnapshot) throws -> AXUIElement? {
    try requireUsableComputerUseSession()
    var value: CFTypeRef?
    guard AXUIElementCopyAttributeValue(AXUIElementCreateApplication(snapshot.app.pid), kAXFocusedUIElementAttribute as CFString, &value) == .success,
          let value, CFGetTypeID(value) == AXUIElementGetTypeID() else { return nil }
    let element = value as! AXUIElement
    try requireActionTarget(element, in: snapshot)
    return element
}

func requireFocusedActionTarget(_ element: AXUIElement, in snapshot: AppSnapshot) throws {
    guard let current = try actionFocusedElement(snapshot), CFEqual(current, element) else {
        throw ComputerUseError.stateUnavailable("Text action focus changed; refresh app state")
    }
}

func verifiedValueActionResult(_ snapshot: AppSnapshot, element: AXUIElement, value: String) -> ToolCallResult {
    let record = snapshot.elements.values.first { $0.element.map { CFEqual($0, element) } ?? false }
    let target = record.map { "\($0.index) \($0.role ?? "text entry")" } ?? "focused text entry"
    return .text("App=\(snapshot.app.bundleIdentifier ?? snapshot.app.name) (pid \(snapshot.app.pid))\nVerified value on \(target): \(String(value.prefix(200)))\nNo tree walk or screenshot; request get_app_state for layout changes.")
}

func appendingObservedActionChange(to result: ToolCallResult, name: String,
                                  before: [String: String], after: [String: String]) -> ToolCallResult {
    let changed = before.keys.sorted().compactMap { key -> String? in
        guard let value = after[key], value != before[key] else { return nil }
        return "\(key): \(String(value.prefix(160)).debugDescription)"
    }
    var content = result.content
    let index = content.firstIndex { $0.dictionary["type"] as? String == "image" } ?? content.endIndex
    content.insert(.text("Verified \(name) changes: " + changed.prefix(8).joined(separator: "; ")), at: index)
    return ToolCallResult(content: content, isError: result.isError)
}
