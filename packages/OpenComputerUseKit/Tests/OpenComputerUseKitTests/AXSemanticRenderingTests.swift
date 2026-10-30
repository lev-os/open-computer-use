import ApplicationServices
import XCTest
@testable import OpenComputerUseKit

/// Synthetic AX data, not expected renderer strings. Logical IDs below are the
/// independent oracle for controls and metadata that an agent must still reach.
final class AXSemanticRenderingTests: XCTestCase {
    private final class Node {
        let id: Int
        let element: AXUIElement
        var attributes: [String: CFTypeRef]
        var children: [Int] = []
        var actions: [String] = []
        var settable = false
        init(_ id: Int, role: String, title: String? = nil) {
            self.id = id
            self.element = AXUIElementCreateApplication(Int32(120_000 + id))
            attributes = ["AXRole": role as CFString, "AXEnabled": kCFBooleanTrue!]
            if let title { attributes["AXTitle"] = title as CFString }
            var point = CGPoint(x: 20 + id * 10, y: 30 + id * 10)
            var size = CGSize(width: 400, height: 200)
            attributes["AXPosition"] = AXValueCreate(.cgPoint, &point)
            attributes["AXSize"] = AXValueCreate(.cgSize, &size)
        }
    }

    private final class Fixture {
        var nodes: [Int: Node] = [:]
        init() {
            let window = add(0, role: "AXWindow", title: "Semantic fixture")
            window.attributes["AXSubrole"] = "AXStandardWindow" as CFString
            window.children = [1]
            let web = add(1, role: "AXWebArea", title: "Fixture page")
            web.attributes["AXURL"] = "https://example.invalid/fixture" as CFString
            web.children = [2]
            let wrapper = add(2, role: "AXGroup")
            wrapper.children = [3, 4]
            let button = add(3, role: "AXButton", title: "Submit")
            button.actions = ["AXPress"]
            let field = add(4, role: "AXTextField", title: "Email")
            field.attributes["AXValue"] = "person@example.invalid" as CFString
            field.settable = true
        }
        @discardableResult func add(_ id: Int, role: String, title: String? = nil) -> Node {
            let node = Node(id, role: role, title: title)
            nodes[id] = node
            return node
        }
        func node(_ element: AXUIElement) -> Node {
            nodes.values.first { CFEqual($0.element, element) }!
        }
        func render(flatten: Bool = false, focused: Int? = nil) -> (lines: [String], records: [Int: ElementRecord]) {
            let cache = AXSnapshotReadCache(batch: { element in
                let node = self.node(element)
                var values = node.attributes.mapValues { AXSnapshotReadCache.Attribute.value($0) }
                values["AXChildren"] = .value(node.children.map { self.nodes[$0]!.element } as CFArray)
                return values
            }, single: { _, _ in (.attributeUnsupported, nil) }, actions: { element in
                (.success, self.node(element).actions)
            }, settable: { element, attribute in
                (.success, attribute == "AXValue" && self.node(element).settable)
            })
            return AXSnapshotReadCache.withCache(cache) {
                renderAXSemanticFixture(root: nodes[0]!.element, focused: focused.flatMap { nodes[$0]?.element },
                                        flattenInertContainers: flatten)
            }
        }
        func index(_ logicalID: Int, in records: [Int: ElementRecord]) -> Int? {
            records.first { _, record in record.element.map { CFEqual($0, nodes[logicalID]!.element) } == true }?.key
        }
    }

    private func assertAgentTargets(_ fixture: Fixture, _ output: (lines: [String], records: [Int: ElementRecord]),
                                    expected: [Int], file: StaticString = #filePath, line: UInt = #line) {
        for logicalID in expected {
            guard let index = fixture.index(logicalID, in: output.records), let record = output.records[index] else {
                XCTFail("Lost semantic target \(logicalID)", file: file, line: line); continue
            }
            XCTAssertEqual(record.index, index, file: file, line: line)
            XCTAssertEqual(record.role, fixture.nodes[logicalID]!.attributes["AXRole"] as? String, file: file, line: line)
            XCTAssertTrue(output.lines.contains { $0.trimmingCharacters(in: .whitespaces).hasPrefix("\(index) ") }, file: file, line: line)
        }
        let text = output.lines.joined(separator: "\n")
        XCTAssertTrue(text.contains("Submit"), file: file, line: line)
        XCTAssertTrue(text.contains("Email"), file: file, line: line)
        XCTAssertTrue(text.contains("person@example.invalid"), file: file, line: line)
        if let index = fixture.index(3, in: output.records) {
            XCTAssertEqual(output.records[index]?.rawActions, ["AXPress"], file: file, line: line)
            XCTAssertNotNil(output.records[index]?.localFrame, file: file, line: line)
        }
    }

    func testBaselineSemanticOracleIncludesControlsAndBackedActionIndexes() {
        let fixture = Fixture()
        let output = fixture.render()
        assertAgentTargets(fixture, output, expected: [0, 1, 3, 4])
        XCTAssertNotNil(fixture.index(2, in: output.records))
    }

    func testCandidatePolicyPreservesNamesValuesAndControlRoles() {
        let fixture = Fixture()
        for policy in [false, true] { assertAgentTargets(fixture, fixture.render(flatten: policy), expected: [0, 1, 3, 4]) }
    }

    func testSemanticGroupsAndActionTargetsAreNeverStructuralNoise() {
        let cases: [(String, (Node) -> Void, Int?)] = [
            ("named", { $0.attributes["AXTitle"] = "Billing" as CFString }, nil),
            ("described", { $0.attributes["AXDescription"] = "Shipping" as CFString }, nil),
            ("help", { $0.attributes["AXHelp"] = "Use this group to submit" as CFString }, nil),
            ("identifier", { $0.attributes["AXIdentifier"] = "payment-group" as CFString }, nil),
            ("value", { $0.attributes["AXValue"] = "ready" as CFString }, nil),
            ("selected", { $0.attributes["AXSelected"] = kCFBooleanTrue }, nil),
            ("expanded", { $0.attributes["AXExpanded"] = kCFBooleanTrue }, nil),
            ("disabled", { $0.attributes["AXEnabled"] = kCFBooleanFalse }, nil),
            ("placeholder", { $0.attributes["AXPlaceholderValue"] = "Choose a plan" as CFString }, nil),
            ("settable", { $0.settable = true; $0.attributes["AXValue"] = "" as CFString }, nil),
            ("primary action", { $0.actions = ["AXPress"] }, nil),
            ("secondary action", { $0.actions = ["AXShowMenu"] }, nil),
            ("subrole", { $0.attributes["AXSubrole"] = "AXLandmarkNavigation" as CFString }, nil),
            ("focused", { _ in }, 2),
        ]
        for (name, configure, focus) in cases {
            let fixture = Fixture(); configure(fixture.nodes[2]!)
            let output = fixture.render(flatten: true, focused: focus)
            assertAgentTargets(fixture, output, expected: [0, 1, 2, 3, 4])
            XCTAssertNotNil(fixture.index(2, in: output.records), name)
        }
    }

    func testRepeatedControlNamesRemainDistinctActionTargets() {
        let fixture = Fixture()
        let second = fixture.add(5, role: "AXButton", title: "Submit")
        second.actions = ["AXPress"]
        fixture.nodes[2]!.children.append(5)
        let output = fixture.render(flatten: true)
        assertAgentTargets(fixture, output, expected: [0, 1, 3, 4, 5])
        XCTAssertNotEqual(fixture.index(3, in: output.records), fixture.index(5, in: output.records))
    }
}
