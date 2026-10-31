import Foundation

/// AX text selection is expressed in UTF-16, not Swift character offsets.
/// An unreadable or invalid range must fall back to the application's key path.
func actionTextReplacement(value: String, range: CFRange?, text: String) -> String? {
    let units = Array(value.utf16)
    func isBoundary(_ index: Int) -> Bool {
        index == 0 || index == units.count || !(0xDC00...0xDFFF).contains(units[index]) || !(0xD800...0xDBFF).contains(units[index - 1])
    }
    guard let range, range.location >= 0, range.length >= 0,
          range.location <= value.utf16.count,
          range.length <= value.utf16.count - range.location,
          isBoundary(range.location), isBoundary(range.location + range.length),
          let selected = Range(NSRange(location: range.location, length: range.length), in: value) else { return nil }
    return value.replacingCharacters(in: selected, with: text)
}
