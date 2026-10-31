import XCTest
@testable import OpenComputerUseKit

final class ActionTextReplacementTests: XCTestCase {
    func testReplacesSelectionInsteadOfAppending() {
        XCTAssertEqual(actionTextReplacement(value: "seed", range: CFRange(location: 0, length: 4), text: "typed"), "typed")
        XCTAssertEqual(actionTextReplacement(value: "ab", range: CFRange(location: 1, length: 0), text: "X"), "aXb")
    }
    func testUTF16AndUnreadableOrInvalidSelection() {
        XCTAssertEqual(actionTextReplacement(value: "a👍中文", range: CFRange(location: 1, length: 2), text: "X"), "aX中文")
        for range in [nil, CFRange(location: -1, length: 0), CFRange(location: 9, length: 0), CFRange(location: 1, length: Int.max), CFRange(location: 2, length: 1)] {
            XCTAssertNil(actionTextReplacement(value: "a👍中文", range: range, text: "X"))
        }
    }
}
