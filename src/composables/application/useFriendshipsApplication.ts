import { useFriendshipsApi } from '@/composables/api/useFriendshipsApi'
import { useFriendshipsStore } from '@/stores/friendships.store'
import { useUserStore } from '@/stores/user.store'

export const useFriendshipsApplication = () => {
  const friendshipsStore = useFriendshipsStore()
  const userStore = useUserStore()
  const {
    getFriends,
    getReceivedRequests,
    getSentRequests,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
    searchUsers,
    updateHandle
  } = useFriendshipsApi()

  const loadAll = async () => {
    friendshipsStore.setLoading(true)
    try {
      const [friendsRes, receivedRes, sentRes] = await Promise.all([
        getFriends(),
        getReceivedRequests(),
        getSentRequests()
      ])
      friendshipsStore.setFriends(friendsRes.result)
      friendshipsStore.setReceivedRequests(receivedRes.result)
      friendshipsStore.setSentRequests(sentRes.result)
      return { success: true }
    } catch {
      return { success: false }
    } finally {
      friendshipsStore.setLoading(false)
    }
  }

  const handleSendRequest = async (handle: string) => {
    try {
      await sendRequest(handle)
      const sentRes = await getSentRequests()
      friendshipsStore.setSentRequests(sentRes.result)
      return { success: true }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al enviar solicitud'
      return { success: false, error: { title: 'Error', message: msg } }
    }
  }

  const handleAcceptRequest = async (requesterId: string) => {
    try {
      await acceptRequest(requesterId)
      friendshipsStore.removeFromReceived(requesterId)
      const friendsRes = await getFriends()
      friendshipsStore.setFriends(friendsRes.result)
      return { success: true }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al aceptar solicitud'
      return { success: false, error: { title: 'Error', message: msg } }
    }
  }

  const handleRejectRequest = async (requesterId: string) => {
    try {
      await rejectRequest(requesterId)
      friendshipsStore.removeFromReceived(requesterId)
      return { success: true }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al rechazar solicitud'
      return { success: false, error: { title: 'Error', message: msg } }
    }
  }

  const handleCancelSent = async (addresseeId: string) => {
    try {
      await removeFriend(addresseeId)
      friendshipsStore.removeSentByAddresseeId(addresseeId)
      return { success: true }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al cancelar solicitud'
      return { success: false, error: { title: 'Error', message: msg } }
    }
  }

  const handleRemoveFriend = async (friendId: string) => {
    try {
      await removeFriend(friendId)
      friendshipsStore.removeFriendById(friendId)
      return { success: true }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al eliminar amigo'
      return { success: false, error: { title: 'Error', message: msg } }
    }
  }

  const handleUpdateHandle = async (handle: string) => {
    try {
      await updateHandle(handle)
      userStore.handle = handle
      return { success: true }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al actualizar handle'
      return { success: false, error: { title: 'Error', message: msg } }
    }
  }

  const handleSearchUsers = async (q: string) => {
    try {
      const res = await searchUsers(q)
      return { success: true, results: res.result }
    } catch {
      return { success: false, results: [] }
    }
  }

  return {
    loadAll,
    handleSendRequest,
    handleAcceptRequest,
    handleRejectRequest,
    handleCancelSent,
    handleRemoveFriend,
    handleUpdateHandle,
    handleSearchUsers
  }
}
