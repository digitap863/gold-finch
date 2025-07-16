import React from 'react'

const adminLayout = ({children}: {children: React.ReactNode}) => {
  return (
    <div>
        <h1>adminLayout</h1>
        {children}
    </div>
  )
}

export default adminLayout