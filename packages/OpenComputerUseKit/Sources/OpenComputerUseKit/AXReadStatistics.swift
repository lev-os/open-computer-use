import Foundation

/// Scoped per-thread profiling for synchronous AX reads. No state crosses reads.
final class AXReadStatistics: NSObject {
    static let key = "OpenComputerUse.AXReadStatistics"
    var milliseconds = 0.0
    var calls: [String: Int] = [:]
    var textMilliseconds = 0.0
    var treeMilliseconds = 0.0

    static var current: AXReadStatistics? {
        Thread.current.threadDictionary[key] as? AXReadStatistics
    }

    static func measureTree<T>(_ body: () throws -> T) rethrows -> T {
        guard TimingLog.enabled, let stats = current else { return try body() }
        let start = TimingLog.now()
        defer { stats.treeMilliseconds += (TimingLog.now() - start) * 1000 }
        return try body()
    }

    static func measure<T>(_ label: String, _ body: () -> T) -> T {
        guard TimingLog.enabled, let stats = current else { return body() }
        let start = TimingLog.now()
        let result = body()
        stats.milliseconds += (TimingLog.now() - start) * 1000
        stats.calls[label, default: 0] += 1
        return result
    }
}
