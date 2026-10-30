import Foundation
import ApplicationServices
@_spi(ReadBenchmark) import OpenComputerUseKit

struct Read: Encodable {
    let tree_ms: Double
    let text_ms: Double
    let ax_ms: Double
    let ax_calls: [String: Int]
    let line_ms: Double
    let element_count: Int
    let indexes_valid: Bool
}
struct Report: Encodable {
    let engine = "ocu-direct"
    let app: String
    let ms: [Double]
    let chars: [Int]
    let median_ms: Double
    let breakdown: [Read]
}

do {
    setenv("OPEN_COMPUTER_USE_DEBUG_TIMING", "1", 0)
    let args = Array(CommandLine.arguments.dropFirst())
    if args == ["doctor", "--json"] {
        let session = LockedUseSession.current()
        let diagnostic: [String: Any] = ["sessionState": session.state.rawValue,
            "accessibilityTrusted": AXIsProcessTrusted(), "auditSessionID": session.auditSessionID as Any? ?? NSNull()]
        print(String(decoding: try JSONSerialization.data(withJSONObject: diagnostic, options: [.sortedKeys]), as: UTF8.self))
        exit(0)
    }
    guard args.count >= 3, let pid = Int32(args[0]), pid > 0 else {
        throw NSError(domain: "OCUReadBench", code: 2, userInfo: [NSLocalizedDescriptionKey:
            "usage: OCUReadBench <pid> <app-name> <bundle-id> [reads=5] [last-snapshot-file]"])
    }
    let reads = args.count > 3 ? Int(args[3]) ?? 0 : 5
    guard (1...100).contains(reads) else { throw NSError(domain: "OCUReadBench", code: 2) }
    var ms: [Double] = [], chars: [Int] = [], breakdown: [Read] = []
    for _ in 0..<reads {
        let start = ProcessInfo.processInfo.systemUptime
        let result = try AccessibilityReadBenchmark.read(pid: pid, name: args[1], bundleIdentifier: args[2])
        ms.append((ProcessInfo.processInfo.systemUptime - start) * 1000)
        chars.append(result.text.utf16.count)
        breakdown.append(Read(tree_ms: result.treeMilliseconds, text_ms: result.textMilliseconds,
                              ax_ms: result.axMilliseconds, ax_calls: result.axCalls, line_ms: result.lineMilliseconds,
                              element_count: result.elementCount, indexes_valid: result.indexesValid))
        if args.count > 4 { try result.text.write(toFile: args[4], atomically: true, encoding: .utf8) }
    }
    let report = Report(app: args[1], ms: ms, chars: chars, median_ms: ms.sorted()[ms.count / 2], breakdown: breakdown)
    print(String(decoding: try JSONEncoder().encode(report), as: UTF8.self))
} catch {
    FileHandle.standardError.write(Data("OCUReadBench: \(error)\n".utf8))
    exit(1)
}
