import OpenBunnyTheme
import OpenBunnyUI
import SwiftUI

struct Themed: View {
  var body: some View {
    Text("x")
      .font(.themeBody)
      .foregroundStyle(Color.muted)
      .background(Rectangle().fill(Color.paperDeep))
      .padding(Spacing.page)
      .frame(minWidth: WindowWidth.windowMinimum)
    VStack(spacing: Spacing.loose) {}
  }
}
