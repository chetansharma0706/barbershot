import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { toast } from './use-toast'

export type OnboardingStep = 
  | 'role_selection' 
  | 'barber_setup' 
    | 'customer_preferences'

export function useOnboarding() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] =useState(true)

  const updateOnboardingStep = async (step: OnboardingStep, completed = false) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    try {
        setLoading(true)
        await supabase
          .from('profiles')
          .update({ 
            onboarding_step: step,
            onboarding_completed: completed 
          })
          .eq('id', user.id)
        
    } catch (error:any) {
        toast({
        title: "Something went wrong",
        description: error.message,
        variant: "destructive",
      });
    }finally {
      setLoading(false)
    }
  }

  const setUserRole = async (role: 'barber' | 'customer') => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
     try {
        setLoading(true)
        await supabase
      .from('profiles')
      .update({ user_role: role })
      .eq('id', user.id)
        
    } catch (error:any) {
        toast({
        title: "Something went wrong",
        description: error.message,
        variant: "destructive",
      });
    }finally {
      setLoading(false)
    }

    
  }

  const completeOnboarding = async (role: 'barber' | 'customer') => {
    await updateOnboardingStep('role_selection', true)
    const destination = role === 'barber' ? '/dashboard' : '/search'
    router.push(destination)
  }

  return {
    updateOnboardingStep,
    setUserRole,
    completeOnboarding,
    loading
  }
}