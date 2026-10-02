#import <Foundation/Foundation.h>
#import <SafariServices/SafariServices.h>

NS_ASSUME_NONNULL_BEGIN

@interface SFSafariExtensionManager (GlyphmarkShim)

+ (void)glyphmark_getStateOfSafariExtensionWithIdentifier:(NSString *)identifier
    completionHandler:
        (void (^)(SFSafariExtensionState *_Nullable state,
                  NSError *_Nullable error))completionHandler
    NS_SWIFT_NAME(glyphmarkGetStateOfSafariExtension(identifier:completionHandler:))
    NS_SWIFT_NONISOLATED;

@end

NS_ASSUME_NONNULL_END
