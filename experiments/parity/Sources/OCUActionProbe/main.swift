import AppKit
import ApplicationServices
import Foundation
import OpenComputerUseKit
import Security

// A terminal-owned process: bypass the app-agent proxy, never the tool service
// or its session guard. Probe results do not establish signed-app acceptance.
final class DirectProbeRuntime: NSObject, NSApplicationDelegate {
    private let server = StdioMCPServer()

    func applicationDidFinishLaunching(_ notification: Notification) {
        Thread.detachNewThreadSelector(#selector(processIO), toTarget: self, with: nil)
    }

    @objc private func processIO() {
        do { try server.run() }
        catch { FileHandle.standardError.write(Data("\(error)\n".utf8)) }
        DispatchQueue.main.async { NSApp.terminate(nil) }
    }
}

@main enum OCUActionProbe {
    @MainActor static func main() {
        if CommandLine.arguments.dropFirst().first == "doctor" {
            var auditID = SecuritySessionId()
            var attributes = SessionAttributeBits()
            let result = SessionGetInfo(callerSecuritySession, &auditID, &attributes)
            let console = CGSessionCopyCurrentDictionary() as? [String: Any] ?? [:]
            let status: [String: Any] = [
                "accessibilityTrusted": AXIsProcessTrusted(),
                "screenCaptureGranted": CGPreflightScreenCaptureAccess(),
                "sessionState": LockedUseSession.current().state.rawValue,
                "securitySessionResult": result,
                "processAuditID": auditID,
                "consoleAuditID": console["kCGSSessionAuditIDKey"] ?? NSNull(),
                "consoleUserID": console[kCGSessionUserIDKey as String] ?? NSNull(),
                "consoleLoginDone": console[kCGSessionLoginDoneKey as String] ?? NSNull(),
                "consoleOnConsole": console[kCGSessionOnConsoleKey as String] ?? NSNull(),
            ]
            let data = try! JSONSerialization.data(withJSONObject: status, options: [.sortedKeys])
            print(String(decoding: data, as: UTF8.self))
            return
        }
        guard CommandLine.arguments.dropFirst().first == "mcp" else {
            print("Usage: OCUActionProbe mcp | doctor\nDirect terminal-owned OpenComputerUseKit probe; no app-agent proxy.")
            return
        }
        guard AXIsProcessTrusted() else {
            FileHandle.standardError.write(Data("Accessibility is not trusted for this direct process\n".utf8))
            exit(1)
        }
        // Fail before discovery, capture, activation or input if the production
        // guard cannot establish that this process belongs to the console session.
        guard LockedUseSession.current().state == .unlocked else {
            FileHandle.standardError.write(Data("Direct probe cannot use an unavailable or locked GUI session; run doctor. No session-guard override is supported.\n".utf8))
            exit(1)
        }
        let app = NSApplication.shared
        app.setActivationPolicy(.accessory)
        let runtime = DirectProbeRuntime()
        app.delegate = runtime
        withExtendedLifetime(runtime) { app.run() }
    }
}
