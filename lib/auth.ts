export const OAUTH_CONFIG = {
  google: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scope: 'https://www.googleapis.com/auth/drive.file',
  },
  onedrive: {
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    scope: 'Files.ReadWrite.AppFolder User.Read',
  }
}

export function initiateOAuth(provider: 'google' | 'onedrive', clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const config = OAUTH_CONFIG[provider]
    // Next.js App Router: app/oauth/callback/page.tsx -> /oauth/callback
    const redirectUri = `${window.location.origin}/oauth/callback`

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'token',
      scope: config.scope,
      state: crypto.randomUUID(), // 보안을 위한 난수
    })

    // Google requires prompt='consent' to ensure refresh token (though we use implicit flow here)
    if (provider === 'google') {
      params.append('prompt', 'consent')
    }

    const width = 600
    const height = 700
    const left = window.screen.width / 2 - width / 2
    const top = window.screen.height / 2 - height / 2

    const popup = window.open(
      `${config.authUrl}?${params.toString()}`,
      'oauth_popup',
      `width=${width},height=${height},left=${left},top=${top}`
    )

    if (!popup) {
      reject(new Error('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.'))
      return
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      
      if (event.data.type === 'OAUTH_SUCCESS') {
        window.removeEventListener('message', handleMessage)
        resolve(event.data.token)
      } else if (event.data.type === 'OAUTH_ERROR') {
        window.removeEventListener('message', handleMessage)
        reject(new Error(event.data.error))
      }
    }

    window.addEventListener('message', handleMessage)
  })
}
