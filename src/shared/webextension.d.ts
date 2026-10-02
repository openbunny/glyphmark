declare namespace browser.storage {
  interface StorageChange {
    oldValue?: unknown
    newValue?: unknown
  }
  interface LocalStorageArea {
    get(keys: string[]): Promise<Record<string, unknown>>
    set(items: Record<string, unknown>): Promise<void>
  }
  const local: LocalStorageArea
  const onChanged: {
    addListener(
      callback: (
        changes: Record<string, StorageChange>,
        areaName: string
      ) => void
    ): void
  }
}

declare namespace browser.runtime {
  function getURL(path: string): string
  function openOptionsPage(): Promise<void>
}

declare namespace browser.tabs {
  interface Tab {
    url?: string
  }
  function query(info: {
    active: boolean
    currentWindow: boolean
  }): Promise<Tab[]>
}
