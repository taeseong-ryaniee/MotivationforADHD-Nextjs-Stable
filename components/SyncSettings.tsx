'use client'

import { useState, useEffect } from 'react'
import { 
  Cloud, 
  Download, 
  Upload, 
  Save, 
  RefreshCw, 
  FileJson, 
  Settings, 
  Check, 
  AlertCircle,
  HardDrive,
  LogIn,
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  exportData, 
  downloadSyncFile, 
  uploadSyncFile, 
  importData, 
  saveS3Config, 
  getS3Config, 
  uploadToS3, 
  listS3Files, 
  downloadFromS3, 
  getSyncStatus 
} from '@/lib/sync'
import { showSuccess, showError, showConfirm, showInfo } from '@/lib/toast'
import type { S3Config } from '@/lib/types'
import { initiateOAuth } from '@/lib/auth'
import { GoogleDriveProvider } from '@/lib/cloud/google'
import { OneDriveProvider } from '@/lib/cloud/onedrive'
import type { CloudProvider } from '@/lib/cloud/types'

export default function SyncSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [s3Config, setS3Config] = useState<S3Config>({
    accessKeyId: '',
    secretAccessKey: '',
    region: 'ap-northeast-2',
    bucketName: '',
    keyPrefix: 'backup'
  })
  const [syncStatus, setSyncStatus] = useState<{ lastSyncAt?: string; syncedWith?: string }>({})
  const [isConfigExpanded, setIsConfigExpanded] = useState(false)
  
  // OAuth States
  const [googleClientId, setGoogleClientId] = useState('')
  const [oneDriveClientId, setOneDriveClientId] = useState('')
  const [activeProvider, setActiveProvider] = useState<CloudProvider | null>(null)

  useEffect(() => {
    loadInitialData()
    // Load saved client IDs from localStorage (convenience)
    setGoogleClientId(localStorage.getItem('google_client_id') || '')
    setOneDriveClientId(localStorage.getItem('onedrive_client_id') || '')
  }, [])

  const loadInitialData = async () => {
    try {
      const config = await getS3Config()
      if (config) {
        setS3Config(config)
      }
      refreshSyncStatus()
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  const refreshSyncStatus = () => {
    setSyncStatus(getSyncStatus())
  }

  const handleExport = async () => {
    try {
      setIsLoading(true)
      const data = await exportData()
      downloadSyncFile(data)
      showSuccess('데이터 내보내기가 완료되었습니다')
    } catch (error) {
      showError('데이터 내보내기 실패', error instanceof Error ? error.message : '알 수 없는 오류')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImport = async () => {
    try {
      const file = await uploadSyncFile()
      
      showConfirm(
        '데이터를 어떻게 가져오시겠습니까?',
        async () => {
          try {
            setIsLoading(true)
            await importData(file, 'merge')
            showSuccess('데이터 병합이 완료되었습니다')
            refreshSyncStatus()
            window.location.reload()
          } catch (error) {
            showError('가져오기 실패', error instanceof Error ? error.message : '오류가 발생했습니다')
          } finally {
            setIsLoading(false)
          }
        },
        {
          description: '병합(기존 데이터 유지) 또는 덮어쓰기를 선택해주세요.',
          confirmLabel: '병합하기 (추천)',
          cancelLabel: '덮어쓰기', 
        }
      )
    } catch (error) {
      if (error instanceof Error && error.message !== 'File selection cancelled') {
        showError('파일 선택 오류', error.message)
      }
    }
  }

  const handleImportOverwrite = async () => {
     try {
      const file = await uploadSyncFile()
      showConfirm(
        '정말 덮어쓰시겠습니까?',
        async () => {
          try {
            setIsLoading(true)
            await importData(file, 'overwrite')
            showSuccess('데이터 복원이 완료되었습니다')
            refreshSyncStatus()
            window.location.reload()
          } catch (error) {
            showError('복원 실패', error instanceof Error ? error.message : '오류가 발생했습니다')
          } finally {
            setIsLoading(false)
          }
        },
        {
          description: '현재 기기의 모든 데이터가 삭제되고 파일의 내용으로 대체됩니다.',
          confirmLabel: '덮어쓰기 (주의)'
        }
      )
    } catch {
      
    }
  }

  const handleSaveConfig = async () => {
    if (!s3Config.accessKeyId || !s3Config.secretAccessKey || !s3Config.bucketName) {
      showError('설정 오류', '필수 항목을 모두 입력해주세요.')
      return
    }

    try {
      setIsLoading(true)
      await saveS3Config(s3Config)
      showSuccess('클라우드 설정이 저장되었습니다')
      setIsConfigExpanded(false)
    } catch (error) {
      showError('설정 저장 실패', error instanceof Error ? error.message : '오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloudBackup = async () => {
    try {
      setIsLoading(true)
      const data = await exportData()
      
      if (activeProvider) {
        // Use active OAuth provider
        await activeProvider.upload(data)
        showSuccess(`${activeProvider.name} 백업 완료`, '데이터가 안전하게 저장되었습니다.')
      } else {
        // Fallback to S3
        await uploadToS3(s3Config, data)
        showSuccess('S3 백업 완료', '데이터가 안전하게 저장되었습니다.')
      }
      refreshSyncStatus()
    } catch (error) {
      showError('백업 실패', error instanceof Error ? error.message : '설정을 확인해주세요.')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloudRestore = async () => {
    try {
      setIsLoading(true)
      let files: string[] | { name: string, id: string }[] = []
      
      if (activeProvider) {
        const list = await activeProvider.list()
        files = list.map(f => ({ name: f.name, id: f.id }))
      } else {
        files = await listS3Files(s3Config)
      }

      if (files.length === 0) {
        showInfo('백업 파일이 없습니다', '먼저 데이터를 백업해주세요.')
        return
      }

      // Simple latest file selection (needs UI for file selection in future)
      const latestFile = files[0]
      const fileName = typeof latestFile === 'string' ? latestFile : latestFile.name
      const fileId = typeof latestFile === 'string' ? latestFile : latestFile.id

      showConfirm(
        '클라우드에서 복원하시겠습니까?',
        async () => {
          try {
            setIsLoading(true)
            let data
            if (activeProvider) {
              data = await activeProvider.download(fileId)
            } else {
              data = await downloadFromS3(s3Config, fileName)
            }
            
            const json = JSON.stringify(data)
            const blob = new Blob([json], { type: 'application/json' })
            const file = new File([blob], fileName, { type: 'application/json' })
            
            await importData(file, 'merge')
            showSuccess('클라우드 복원 완료', `${fileName} 파일에서 복원되었습니다.`)
            refreshSyncStatus()
            window.location.reload()
          } catch (error) {
            showError('복원 실패', error instanceof Error ? error.message : '오류가 발생했습니다')
          } finally {
            setIsLoading(false)
          }
        },
        {
          description: `가장 최근 백업(${fileName})을 병합합니다.`,
          confirmLabel: '복원하기'
        }
      )
    } catch (error) {
      showError('목록 불러오기 실패', '설정을 확인해주세요.')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: 'google' | 'onedrive') => {
    const clientId = provider === 'google' ? googleClientId : oneDriveClientId
    if (!clientId) {
      return showError('Client ID 필요', '설정에서 Client ID를 입력해주세요.')
    }

    try {
      setIsLoading(true)
      const token = await initiateOAuth(provider, clientId)
      
      // Save Client ID for convenience
      if (provider === 'google') localStorage.setItem('google_client_id', clientId)
      else localStorage.setItem('onedrive_client_id', clientId)

      let newProvider: CloudProvider
      if (provider === 'google') {
        newProvider = new GoogleDriveProvider(token)
      } else {
        newProvider = new OneDriveProvider(token)
      }
      
      setActiveProvider(newProvider)
      showSuccess('로그인 성공', `${newProvider.name}와 연결되었습니다.`)
    } catch (error) {
      showError('로그인 실패', error instanceof Error ? error.message : '인증 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-token shadow-md transition-all hover:shadow-lg">
        <CardHeader className="bg-surface-muted/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <FileJson className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">파일 백업 / 복원</CardTitle>
              <CardDescription>데이터를 JSON 파일로 저장하거나 불러옵니다.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
          <Button 
            variant="outline" 
            className="h-auto flex-col items-start gap-2 p-4 hover:border-blue-200 hover:bg-blue-50/50"
            onClick={handleExport}
            disabled={isLoading}
          >
            <div className="flex w-full items-center gap-2 font-semibold text-primary">
              <Download className="h-4 w-4 text-blue-500" />
              내보내기 (백업)
            </div>
            <p className="text-xs text-secondary text-left font-normal">
              현재 데이터를 파일로 다운로드합니다.
            </p>
          </Button>

          <Button 
            variant="outline" 
            className="h-auto flex-col items-start gap-2 p-4 hover:border-green-200 hover:bg-green-50/50"
            onClick={handleImport}
            disabled={isLoading}
          >
             <div className="flex w-full items-center gap-2 font-semibold text-primary">
              <Upload className="h-4 w-4 text-green-600" />
              가져오기 (복원)
            </div>
            <p className="text-xs text-secondary text-left font-normal">
              백업 파일을 선택하여 데이터를 병합합니다.
            </p>
          </Button>
          
          <div className="sm:col-span-2 flex justify-end">
            <button 
              onClick={handleImportOverwrite}
              className="text-xs text-secondary underline hover:text-red-500 transition-colors"
              disabled={isLoading}
            >
              혹시 덮어쓰기가 필요하신가요? (고급)
            </button>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-token shadow-md transition-all hover:shadow-lg">
        <CardHeader className="bg-surface-muted/30 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
                <Cloud className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">클라우드 동기화</CardTitle>
                <CardDescription>다양한 클라우드 서비스와 데이터를 동기화합니다.</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs defaultValue="s3" className="w-full" onValueChange={() => setActiveProvider(null)}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="s3">AWS S3</TabsTrigger>
              <TabsTrigger value="google">Google</TabsTrigger>
              <TabsTrigger value="onedrive">OneDrive</TabsTrigger>
              <TabsTrigger value="icloud">iCloud</TabsTrigger>
            </TabsList>

            <TabsContent value="s3" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">AWS S3 설정</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsConfigExpanded(!isConfigExpanded)}
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                  {isConfigExpanded ? '설정 닫기' : '설정 열기'}
                </Button>
              </div>

              {isConfigExpanded && (
                <div className="mb-6 rounded-xl border border-token bg-surface-muted/50 p-4 animate-in fade-in slide-in-from-top-2">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-secondary ml-1">Bucket Name</label>
                      <Input 
                        placeholder="my-backup-bucket"
                        value={s3Config.bucketName}
                        onChange={(e) => setS3Config({...s3Config, bucketName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-secondary ml-1">Region</label>
                      <Input 
                        placeholder="ap-northeast-2"
                        value={s3Config.region}
                        onChange={(e) => setS3Config({...s3Config, region: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-secondary ml-1">Access Key ID</label>
                      <Input 
                        type="password"
                        placeholder="AKIA..."
                        value={s3Config.accessKeyId}
                        onChange={(e) => setS3Config({...s3Config, accessKeyId: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-secondary ml-1">Secret Access Key</label>
                      <Input 
                        type="password"
                        placeholder="wJalr..."
                        value={s3Config.secretAccessKey}
                        onChange={(e) => setS3Config({...s3Config, secretAccessKey: e.target.value})}
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                      <label className="text-xs font-medium text-secondary ml-1">Key Prefix (Folder)</label>
                      <Input 
                        placeholder="backups (optional)"
                        value={s3Config.keyPrefix}
                        onChange={(e) => setS3Config({...s3Config, keyPrefix: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button size="sm" onClick={handleSaveConfig} isLoading={isLoading}>
                      <Save className="mr-2 h-4 w-4" />
                      설정 저장
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <Button 
                  className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm hover:shadow-purple-500/20"
                  onClick={handleCloudBackup}
                  disabled={isLoading || !s3Config.bucketName}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  S3에 백업하기
                </Button>
                <Button 
                  variant="outline"
                  className="border-purple-200 text-purple-700 hover:bg-purple-50"
                  onClick={handleCloudRestore}
                  disabled={isLoading || !s3Config.bucketName}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  S3에서 복원하기
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="google" className="py-4 text-center space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-blue-50 rounded-full">
                  <Cloud className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="font-medium">Google Drive 연동</h3>
                
                <div className="w-full max-w-sm space-y-2 text-left">
                  <label className="text-xs font-medium text-secondary ml-1">Google Client ID</label>
                  <Input 
                    placeholder="1234...apps.googleusercontent.com"
                    value={googleClientId}
                    onChange={(e) => setGoogleClientId(e.target.value)}
                  />
                  <p className="text-[10px] text-secondary">
                    * Google Cloud Console에서 발급받은 Client ID가 필요합니다.
                  </p>
                </div>

                {activeProvider?.type === 'google' ? (
                  <div className="space-y-4 w-full max-w-sm">
                    <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 p-2 rounded-lg text-sm">
                      <Check className="h-4 w-4" />
                      연결됨
                    </div>
                    <div className="grid gap-2 grid-cols-2">
                      <Button onClick={handleCloudBackup} disabled={isLoading}>백업하기</Button>
                      <Button variant="outline" onClick={handleCloudRestore} disabled={isLoading}>복원하기</Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    onClick={() => handleOAuthLogin('google')} 
                    disabled={isLoading || !googleClientId}
                    className="w-full max-w-sm"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Google 로그인
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="onedrive" className="py-4 text-center space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-blue-50 rounded-full">
                  <Cloud className="h-8 w-8 text-blue-700" />
                </div>
                <h3 className="font-medium">OneDrive 연동</h3>
                
                <div className="w-full max-w-sm space-y-2 text-left">
                  <label className="text-xs font-medium text-secondary ml-1">Microsoft Client ID</label>
                  <Input 
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    value={oneDriveClientId}
                    onChange={(e) => setOneDriveClientId(e.target.value)}
                  />
                  <p className="text-[10px] text-secondary">
                    * Azure Portal에서 발급받은 Application (Client) ID가 필요합니다.
                  </p>
                </div>

                {activeProvider?.type === 'onedrive' ? (
                  <div className="space-y-4 w-full max-w-sm">
                    <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 p-2 rounded-lg text-sm">
                      <Check className="h-4 w-4" />
                      연결됨
                    </div>
                    <div className="grid gap-2 grid-cols-2">
                      <Button onClick={handleCloudBackup} disabled={isLoading}>백업하기</Button>
                      <Button variant="outline" onClick={handleCloudRestore} disabled={isLoading}>복원하기</Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    onClick={() => handleOAuthLogin('onedrive')} 
                    disabled={isLoading || !oneDriveClientId}
                    className="w-full max-w-sm"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Microsoft 로그인
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="icloud" className="py-4">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="p-4 bg-gray-100 rounded-full dark:bg-gray-800">
                  <HardDrive className="h-8 w-8 text-gray-600 dark:text-gray-300" />
                </div>
                <h3 className="font-medium">iCloud Drive / 로컬 파일</h3>
                <p className="text-sm text-secondary max-w-xs">
                  '파일 내보내기' 기능을 사용하여 <strong>iCloud Drive</strong> 폴더에 저장하면, 
                  모든 Apple 기기에서 파일에 접근할 수 있습니다.
                </p>
                <Button onClick={handleExport} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  iCloud Drive에 저장하기 (내보내기)
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {syncStatus.lastSyncAt && (
            <div className="mt-6 flex items-center gap-2 rounded-lg bg-surface-muted px-3 py-2 text-xs text-secondary">
              <Check className="h-3 w-3 text-green-500" />
              <span>
                마지막 동기화: {new Date(syncStatus.lastSyncAt).toLocaleString('ko-KR')}
                {syncStatus.syncedWith && ` (기기: ${syncStatus.syncedWith.slice(0, 8)}...)`}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="flex items-start gap-2 rounded-lg bg-orange-50 p-4 text-xs text-orange-800 dark:bg-orange-900/20 dark:text-orange-200">
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
        <p>
          주의: 클라우드 동기화는 설정된 스토리지에 직접 접근합니다. 
          중요한 데이터는 반드시 '파일 내보내기'로 별도 보관하는 것을 권장합니다.
        </p>
      </div>
    </div>
  )
}
