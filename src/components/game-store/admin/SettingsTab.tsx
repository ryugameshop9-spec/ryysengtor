'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Save, Eye, EyeOff, Key, Shield } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SettingsTabProps {
  token: string
}

export default function SettingsTab({ token }: SettingsTabProps) {
  const queryClient = useQueryClient()
  const [showApiKey, setShowApiKey] = useState(false)
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to fetch settings')
      return res.json()
    },
  })

  const settings = settingsData?.settings || []
  const getSetting = (key: string) =>
    settings.find((s: { key: string; value: string }) => s.key === key)?.value || ''

  const [apiKey, setApiKey] = useState('')
  const [merchantCode, setMerchantCode] = useState('')
  const [privateKey, setPrivateKey] = useState('')

  // Initialize form values when settings load
  const [initialized, setInitialized] = useState(false)
  if (settings.length > 0 && !initialized) {
    setApiKey(getSetting('tripay_api_key'))
    setMerchantCode(getSetting('tripay_merchant_code'))
    setPrivateKey(getSetting('tripay_private_key'))
    setInitialized(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setSuccess(false)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          settings: [
            { key: 'tripay_api_key', value: apiKey },
            { key: 'tripay_merchant_code', value: merchantCode },
            { key: 'tripay_private_key', value: privateKey },
          ],
        }),
      })
      if (!res.ok) throw new Error('Failed to save settings')
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Save error:', err)
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-neon-blue" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gradient">Pengaturan</h2>
        <p className="text-muted-foreground text-sm mt-1">Konfigurasi Tripay payment gateway</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-card/50 border-white/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-neon-purple" />
              Tripay Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* API Key */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Key className="w-4 h-4 text-neon-blue" />
                API Key
              </Label>
              <div className="relative">
                <Input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Masukkan Tripay API Key"
                  className="bg-input/30 border-white/10 focus:border-neon-blue/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Merchant Code */}
            <div className="space-y-2">
              <Label>Merchant Code</Label>
              <Input
                type="text"
                value={merchantCode}
                onChange={(e) => setMerchantCode(e.target.value)}
                placeholder="Masukkan Merchant Code"
                className="bg-input/30 border-white/10 focus:border-neon-blue/50"
              />
            </div>

            {/* Private Key */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Key className="w-4 h-4 text-neon-purple" />
                Private Key
              </Label>
              <div className="relative">
                <Input
                  type={showPrivateKey ? 'text' : 'password'}
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  placeholder="Masukkan Private Key"
                  className="bg-input/30 border-white/10 focus:border-neon-blue/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-3">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-neon-blue to-neon-purple hover:opacity-90 text-white glow-blue"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Simpan
                  </>
                )}
              </Button>
              {success && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-green-500 text-sm"
                >
                  Pengaturan berhasil disimpan!
                </motion.span>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
