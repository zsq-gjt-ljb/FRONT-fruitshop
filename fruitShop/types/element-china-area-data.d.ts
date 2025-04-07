declare module 'element-china-area-data' {
  export const regionData: Array<{
    value: string
    label: string
    children: Array<{
      value: string
      label: string
      children: Array<{ value: string; label: string }>
    }>
  }>
  
  export const codeToText: Record<string, string>
} 