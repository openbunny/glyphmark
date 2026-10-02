import type { Provider } from "../shared/provider.ts"
import { azureDevops } from "./azureDevops.ts"
import { bitbucket } from "./bitbucket.ts"
import { forgejo } from "./forgejo.ts"
import { gitea } from "./gitea.ts"
import { gitee } from "./gitee.ts"
import { github } from "./github.ts"
import { gitlab } from "./gitlab.ts"
import { sourceforge } from "./sourceforge.ts"
import { tangled } from "./tangled.ts"

export const PROVIDERS: readonly Provider[] = [
  github,
  bitbucket,
  azureDevops,
  gitlab,
  gitea,
  gitee,
  sourceforge,
  forgejo,
  tangled,
]

export const providerFor = (url: URL): Provider | undefined =>
  PROVIDERS.find((provider) => provider.matches(url))
