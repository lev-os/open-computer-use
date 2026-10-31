import XCTest
@testable import OpenComputerUseKit

final class DragEndpointVerificationTests: XCTestCase {
    private let start = CGPoint(x: 20, y: 550)
    private let end = CGPoint(x: 100, y: 560)

    func testWaitsForMouseUpAndAcceptsFreshMatchingEndpoints() throws {
        var polls = 0
        try verifyDeliveredDrag(after: 4, start: start, end: end) {
            polls += 1
            return DragEndpointReceipt(sequence: 5, start: self.start, end: self.end,
                                       mouseUp: polls > 1 ? self.end : nil)
        }
        XCTAssertEqual(polls, 2)
    }

    func testMismatchedDownDragAndUpEachFail() {
        let wrong = CGPoint(x: end.x + 12, y: end.y)
        for receipt in [
            DragEndpointReceipt(sequence: 5, start: wrong, end: end, mouseUp: end),
            DragEndpointReceipt(sequence: 5, start: start, end: wrong, mouseUp: end),
            DragEndpointReceipt(sequence: 5, start: start, end: end, mouseUp: wrong),
        ] {
            XCTAssertThrowsError(try verifyDeliveredDrag(after: 4, start: start, end: end, timeout: 0, read: { receipt })) {
                XCTAssertTrue(String(describing: $0).contains("endpoints mismatch"))
            }
        }
    }

    func testOldMissingAndIncompleteReceiptsFail() {
        for receipt in [nil,
            DragEndpointReceipt(sequence: 4, start: start, end: end, mouseUp: end),
            DragEndpointReceipt(sequence: 5, start: start, end: end, mouseUp: nil),
        ] {
            XCTAssertThrowsError(try verifyDeliveredDrag(after: 4, start: start, end: end, timeout: 0, read: { receipt }))
        }
        XCTAssertThrowsError(try verifyDeliveredDrag(after: 4, start: start, end: end, timeout: 0,
            read: { throw ComputerUseError.stateUnavailable("wrong window") }))
    }

    func testEnvelopeRoundTripAndMalformedGeometry() throws {
        let envelope = DragVerificationEnvelope(pid: 123, windowID: 45,
            bounds: CGRect(x: 10, y: 20, width: 640, height: 678), pad: nil,
            receipt: DragEndpointReceipt(sequence: 5, start: start, end: end, mouseUp: end))
        let text = dragVerificationPrefix + String(decoding: try JSONEncoder().encode(envelope), as: UTF8.self)
        XCTAssertEqual(try decodeDragVerification(text).receipt?.end, end)
        XCTAssertThrowsError(try decodeDragVerification("old label"))
        XCTAssertThrowsError(try decodeDragVerification(dragVerificationPrefix + "{}"))
        XCTAssertThrowsError(try decodeDragVerification(dragVerificationPrefix + "{\"v\":1,\"pid\":123,\"win\":45,\"bounds\":[0,0,0,20]}"))
    }
}
