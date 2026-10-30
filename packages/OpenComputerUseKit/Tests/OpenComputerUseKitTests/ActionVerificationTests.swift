import XCTest
@testable import OpenComputerUseKit

final class ActionVerificationTests: XCTestCase {
    func testDefaultStateReadBackIsBoundedAndFullIsExplicit() {
        XCTAssertTrue(actionReadBackEnabled(environment: [:]))
        XCTAssertFalse(fullActionReadBackEnabled(environment: [:]))
        XCTAssertTrue(fullActionReadBackEnabled(environment: ["OPEN_COMPUTER_USE_ACTION_READ_BACK": "1"]))
        XCTAssertFalse(fullActionReadBackEnabled(environment: ["OPEN_COMPUTER_USE_ACTION_READ_BACK": "0"]))
    }
    func testIgnoredValueWriteAndChangedWindowCannotReportSuccess() {
        XCTAssertThrowsError(try applyVerifiedActionValue("new", timeout: 0, validate: {}, write: {}, read: { "old" }))
        var wrote = false
        XCTAssertThrowsError(try applyVerifiedActionValue("new", timeout: 0,
            validate: { throw ComputerUseError.message("wrong window") }, write: { wrote = true }, read: { "new" }))
        XCTAssertFalse(wrote)
        var checks = 0
        XCTAssertThrowsError(try applyVerifiedActionValue("new", timeout: 0,
            validate: { checks += 1; if checks > 1 { throw ComputerUseError.message("window changed") } },
            write: { wrote = true }, read: { "new" }))
        XCTAssertTrue(wrote)
    }
    func testAppliedValueAndExactUTF16AreVerified() throws {
        var value = "old"
        try applyVerifiedActionValue("new", validate: {}, write: { value = "new" }, read: { value })
        XCTAssertFalse(actionValueMatches("é", requested: "e\u{301}"))
        XCTAssertTrue(actionValueMatches(NSNumber(value: 0.5), requested: "0.50"))
    }
    func testNoopAndDisappearingObservablesFailClosed() throws {
        for after in [["offset": "0"], [:]] {
            XCTAssertThrowsError(try requireObservedActionChange("scroll", before: ["offset": "0"], timeout: 0, validate: {}, read: { after }))
        }
        try requireObservedActionChange("scroll", before: ["offset": "0"], timeout: 0, validate: {}, read: { ["offset": "1"] })
    }
}
