#import "SafariExtensionStateShim.h"

@implementation SFSafariExtensionManager (GlyphmarkShim)

+ (void)glyphmark_getStateOfSafariExtensionWithIdentifier:(NSString *)identifier
    completionHandler:
        (void (^)(SFSafariExtensionState *_Nullable state,
                  NSError *_Nullable error))completionHandler {
  [self getStateOfSafariExtensionWithIdentifier:identifier completionHandler:completionHandler];
}

@end
