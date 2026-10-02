const byId = (id: string): HTMLElement => {
  const found = document.getElementById(id)
  if (!found) throw new Error(`missing element #${id}`)
  return found
}

export const getInput = (id: string): HTMLInputElement => {
  const found = byId(id)
  if (!(found instanceof HTMLInputElement))
    throw new Error(`#${id} is not an input`)
  return found
}

export const getSelect = (id: string): HTMLSelectElement => {
  const found = byId(id)
  if (!(found instanceof HTMLSelectElement))
    throw new Error(`#${id} is not a select`)
  return found
}

export const getButton = (id: string): HTMLButtonElement => {
  const found = byId(id)
  if (!(found instanceof HTMLButtonElement))
    throw new Error(`#${id} is not a button`)
  return found
}

export const getElement = (id: string): HTMLElement => byId(id)
