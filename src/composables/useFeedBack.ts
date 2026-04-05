import { useToast } from '~/components/organisms/toast/useToast'

export function useFeedback() {
  const { show } = useToast()

  const success = (title: string, description?: string) =>
    show({ title, description, type: 'success' })

  const error = (title: string, description?: string) => show({ title, description, type: 'error' })

  return { success, error }
}
