'use client'

import { SignUp, useUser } from '@clerk/nextjs'

export default function Home() {
  const { isSignedIn } = useUser()

  if (!isSignedIn) {
    return <SignUp/>
  }

  return <div>Welcome!</div>
}