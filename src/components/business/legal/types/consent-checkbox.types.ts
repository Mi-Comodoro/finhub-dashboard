export interface ConsentCheckboxProps {
  /** Checked state (v-model) */
  modelValue: boolean
  /** Current version of the data policy, shown next to the link */
  policyVersion?: string
  /** Highlights the checkbox when the person tried to continue without accepting */
  invalid?: boolean
  id?: string
}
