import AppKit
import SwiftUI

struct Literals: View {
  var body: some View {
    Text("x")
      .font(.system(size: 12))
      .font(.caption)
      .foregroundStyle(Color(red: 0.1, green: 0.2, blue: 0.3))
      .cornerRadius(4)
      .background(Color(white: 0.5))
      .padding(12)
      .padding(.horizontal, 8)
      .frame(minWidth: 280)
      .frame(width: 280)
    VStack(spacing: 4) {}
  }

  let named = Font.custom("Courier", size: 12)
  let native = NSColor(srgbRed: 0, green: 0, blue: 0, alpha: 1)
  let shape = RoundedRectangle(cornerRadius: 4)
}
