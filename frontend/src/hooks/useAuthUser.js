import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { getAuthUser } from '../lib/api'

const useAuthUser = () => {
    const authUser = useQuery({
        queryKey: ["authUser"],
        queryFn: getAuthUser,
        retry: false,
      })

      return {
        authUser : authUser.data?.user,
        isLoading: authUser.isLoading,
      }
}

export default useAuthUser