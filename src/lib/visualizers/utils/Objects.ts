// Deep copy to create a new instance of the object
export const deepClone = (obj: unknown) => {
   return JSON.parse(JSON.stringify(obj)) as typeof obj
}
