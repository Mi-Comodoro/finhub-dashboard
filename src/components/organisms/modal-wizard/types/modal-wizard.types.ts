export interface ModalWizardProps {
  show: boolean
  title?: string
  onClose?: () => void
  /** Si es true (default), un clic en el overlay con datos editados pide confirmacion en vez de cerrar. */
  protectUnsaved?: boolean
}
