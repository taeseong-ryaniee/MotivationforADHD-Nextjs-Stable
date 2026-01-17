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
  AlertCircle 
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
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

  useEffect(() => {
    loadInitialData()
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
      await uploadToS3(s3Config, data)
      showSuccess('클라우드 백업 완료', '데이터가 안전하게 저장되었습니다.')
      refreshSyncStatus()
    } catch (error) {
      showError('백업 실패', '클라우드 설정을 확인해주세요.')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloudRestore = async () => {
    try {
      setIsLoading(true)
      const files = await listS3Files(s3Config)
      if (files.length === 0) {
        showInfo('백업 파일이 없습니다', '먼저 데이터를 백업해주세요.')
        return
      }

      files.sort().reverse()
      const latestFile = files[0]

      showConfirm(
        '클라우드에서 복원하시겠습니까?',
        async () => {
          try {
            setIsLoading(true)
            const data = await downloadFromS3(s3Config, latestFile)
            
            const json = JSON.stringify(data)
            const blob = new Blob([json], { type: 'application/json' })
            const file = new File([blob], latestFile, { type: 'application/json' })
            
            await importData(file, 'merge')
            showSuccess('클라우드 복원 완료', `${latestFile} 파일에서 복원되었습니다.`)
            refreshSyncStatus()
            window.location.reload()
          } catch (error) {
            showError('복원 실패', error instanceof Error ? error.message : '오류가 발생했습니다')
          } finally {
            setIsLoading(false)
          }
        },
        {
          description: `가장 최근 백업(${latestFile})을 병합합니다.`,
          confirmLabel: '복원하기'
        }
      )
    } catch (error) {
      showError('목록 불러오기 실패', '클라우드 설정을 확인해주세요.')
      console.error(error)
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
                <CardTitle className="text-lg">클라우드 동기화 (S3)</CardTitle>
                <CardDescription>AWS S3 호환 스토리지를 사용하여 데이터를 동기화합니다.</CardDescription>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsConfigExpanded(!isConfigExpanded)}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              설정
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
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
              클라우드에 백업하기
            </Button>
            <Button 
              variant="outline"
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
              onClick={handleCloudRestore}
              disabled={isLoading || !s3Config.bucketName}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              최근 백업 불러오기
            </Button>
          </div>

          {syncStatus.lastSyncAt && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-surface-muted px-3 py-2 text-xs text-secondary">
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
          주의: 클라우드 동기화는 설정된 S3 버킷에 직접 접근합니다. 
          중요한 데이터는 반드시 '파일 내보내기'로 별도 보관하는 것을 권장합니다.
        </p>
      </div>
    </div>
  )
}
