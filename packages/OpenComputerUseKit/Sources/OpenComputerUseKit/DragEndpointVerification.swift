import ApplicationServices
import Foundation

public let dragVerificationIdentifier = "ocu-drag-receipt"
public let dragVerificationPrefix = "OCU_DRAG_V1 "

/// App-provided acknowledgement of native events, in window-top-left points.
public struct DragEndpointReceipt: Codable, Equatable, Sendable {
    public let sequence: Int
    public let start: CGPoint
    public let end: CGPoint
    public let mouseUp: CGPoint?
    enum CodingKeys: String, CodingKey { case sequence = "n", start = "s", end = "e", mouseUp = "u" }
    public init(sequence: Int, start: CGPoint, end: CGPoint, mouseUp: CGPoint?) {
        self.sequence = sequence; self.start = start; self.end = end; self.mouseUp = mouseUp
    }
}

/// A host can publish this envelope as the AXValue of a read-only receipt label.
/// `pad` is optional benchmark geometry; endpoint verification does not depend on it.
public struct DragVerificationEnvelope: Codable, Sendable {
    public let version: Int
    public let pid: Int32
    public let windowID: UInt32
    public let bounds: [Double]
    public let pad: [Double]?
    public let receipt: DragEndpointReceipt?
    enum CodingKeys: String, CodingKey { case version = "v", pid, windowID = "win", bounds, pad, receipt = "r" }
    public init(pid: Int32, windowID: UInt32, bounds: CGRect, pad: CGRect?, receipt: DragEndpointReceipt?) {
        version = 1; self.pid = pid; self.windowID = windowID
        self.bounds = [bounds.minX, bounds.minY, bounds.width, bounds.height]
        self.pad = pad.map { [$0.minX, $0.minY, $0.width, $0.height] }
        self.receipt = receipt
    }
}

func decodeDragVerification(_ value: String) throws -> DragVerificationEnvelope {
    guard let range = value.range(of: dragVerificationPrefix) else {
        throw ComputerUseError.stateUnavailable("drag endpoint acknowledgement is unavailable")
    }
    let data = Data(value[range.upperBound...].utf8)
    guard let result = try? JSONDecoder().decode(DragVerificationEnvelope.self, from: data),
          result.version == 1, result.bounds.count == 4,
          result.bounds.allSatisfy(\.isFinite), result.bounds[2] > 0, result.bounds[3] > 0 else {
        throw ComputerUseError.stateUnavailable("drag endpoint acknowledgement is malformed")
    }
    return result
}

func readDragVerification(_ element: AXUIElement, snapshot: AppSnapshot) throws -> DragVerificationEnvelope {
    try requireActionTarget(element, in: snapshot)
    var value: CFTypeRef?
    guard AXUIElementCopyAttributeValue(element, kAXValueAttribute as CFString, &value) == .success,
          let text = value as? String else {
        throw ComputerUseError.stateUnavailable("drag endpoint acknowledgement is unreadable")
    }
    let envelope = try decodeDragVerification(text)
    guard let bounds = snapshot.windowBounds, envelope.pid == snapshot.app.pid,
          envelope.windowID == snapshot.targetWindowID,
          zip(envelope.bounds, [bounds.minX, bounds.minY, bounds.width, bounds.height]).allSatisfy({ abs($0 - $1) <= 1 }) else {
        throw ComputerUseError.stateUnavailable("drag acknowledgement belongs to a different app, window or geometry; refresh app state")
    }
    return envelope
}

func verifyDeliveredDrag(after sequence: Int, start: CGPoint, end: CGPoint, timeout: TimeInterval = 0.2,
                         read: () throws -> DragEndpointReceipt?) throws {
    let deadline = ProcessInfo.processInfo.systemUptime + timeout
    repeat {
        if let receipt = try read(), receipt.sequence > sequence, receipt.mouseUp != nil {
            try requireMatchingDragEndpoints(receipt, after: sequence, start: start, end: end)
            return
        }
        if ProcessInfo.processInfo.systemUptime >= deadline { break }
        Thread.sleep(forTimeInterval: 0.005)
    } while true
    throw ComputerUseError.stateUnavailable("drag has no fresh completed endpoint acknowledgement")
}

func requireMatchingDragEndpoints(_ receipt: DragEndpointReceipt, after sequence: Int,
                                  start: CGPoint, end: CGPoint, tolerance: Double = 1) throws {
    guard receipt.sequence > sequence, let up = receipt.mouseUp else {
        throw ComputerUseError.stateUnavailable("drag has no fresh completed endpoint acknowledgement")
    }
    func matches(_ a: CGPoint, _ b: CGPoint) -> Bool {
        a.x.isFinite && a.y.isFinite && abs(a.x - b.x) <= tolerance && abs(a.y - b.y) <= tolerance
    }
    guard matches(receipt.start, start), matches(receipt.end, end), matches(up, end) else {
        throw ComputerUseError.stateUnavailable("drag endpoints mismatch: requested start=(\(start.x),\(start.y)) end=(\(end.x),\(end.y)); delivered start=(\(receipt.start.x),\(receipt.start.y)) end=(\(receipt.end.x),\(receipt.end.y)) up=(\(up.x),\(up.y))")
    }
}
