// rules.ts (atau letak dalam composable)
export const required = (label = 'This field') => 
  (value: string) => !!value || `${label} is required.`

export const maxLength = (max: number) => 
  (value: string) => (value?.length <= max) || `Must be less than ${max} characters.`

export const isEmail = 
  (value: string) => /.+@.+\..+/.test(value) || 'E-mail must be valid.'