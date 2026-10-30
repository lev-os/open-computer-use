import Foundation

/// Compact text retains all nodes and fields. Only their spelling and whitespace
/// change; action records and the predicates that choose nodes use the raw data.
enum AXTreeTextFormatting {
    static let legend = "[tab=4 w=settable]"

    static func indentation(_ depth: Int, compact: Bool) -> String {
        guard compact else { return String(repeating: "\t", count: depth) }
        return String(repeating: "\t", count: depth / 4) + String(repeating: " ", count: depth % 4)
    }

    static func traitTokens(_ traits: [String], compact: Bool) -> [String] {
        guard compact else { return traits }
        let types = ["string": "str", "boolean": "bool", "float": "float"]
        var result: [String] = [], index = 0
        while index < traits.count {
            if traits[index] == "settable" {
                if index + 1 < traits.count, let type = types[traits[index + 1]] {
                    result.append("w:\(type)"); index += 2; continue
                }
                result.append("w")
            } else { result.append(traits[index]) }
            index += 1
        }
        return result
    }

    static func role(_ role: String, compact: Bool) -> String {
        compact && role == "container" ? "group" : role
    }

    static func valueSegment(_ segment: String, compact: Bool) -> String {
        guard compact, segment.hasPrefix(" Value: ") else { return segment }
        return " = " + segment.dropFirst(" Value: ".count)
    }
}
