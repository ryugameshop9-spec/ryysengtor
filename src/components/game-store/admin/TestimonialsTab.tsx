'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Loader2, Star } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TestimonialsTabProps {
  token: string
}

interface Testimonial {
  id: string
  name: string
  text: string
  rating: number
  avatar: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

const emptyForm = {
  name: '',
  text: '',
  rating: 5,
  avatar: '',
}

export default function TestimonialsTab({ token }: TestimonialsTabProps) {
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [form, setForm] = useState(emptyForm)

  const { data: testimonialsData, isLoading } = useQuery({
    queryKey: ['admin-testimonials'],
    queryFn: async () => {
      const res = await fetch('/api/testimonials')
      if (!res.ok) throw new Error('Failed to fetch testimonials')
      return res.json()
    },
  })

  const testimonials: Testimonial[] = testimonialsData?.testimonials || []

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch('/api/admin/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: 'testimonial', data }),
      })
      if (!res.ok) throw new Error('Failed to create testimonial')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] })
      closeForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: typeof form & { id: string }) => {
      const res = await fetch('/api/admin/manage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: 'testimonial', id: data.id, data }),
      })
      if (!res.ok) throw new Error('Failed to update testimonial')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] })
      closeForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/manage?type=testimonial&id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to delete testimonial')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] })
    },
  })

  const openCreate = () => {
    setEditingTestimonial(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  const openEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial)
    setForm({
      name: testimonial.name,
      text: testimonial.text,
      rating: testimonial.rating,
      avatar: testimonial.avatar || '',
    })
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingTestimonial(null)
    setForm(emptyForm)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingTestimonial) {
      updateMutation.mutate({ ...form, id: editingTestimonial.id })
    } else {
      createMutation.mutate(form)
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-neon-blue" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gradient">Testimoni</h2>
          <p className="text-muted-foreground text-sm mt-1">Kelola testimoni pelanggan</p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-gradient-to-r from-neon-blue to-neon-purple hover:opacity-90 text-white glow-blue"
        >
          <Plus className="w-4 h-4" />
          Tambah Testimoni
        </Button>
      </div>

      {/* Testimonial List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-card/50 border-white/5 backdrop-blur-sm hover:border-white/10 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-white font-bold shrink-0">
                      {testimonial.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold truncate">{testimonial.name}</h3>
                        {!testimonial.active && (
                          <Badge variant="destructive" className="text-xs shrink-0">Nonaktif</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < testimonial.rating
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-muted-foreground/30'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                        {testimonial.text}
                      </p>
                      <div className="flex items-center gap-1 mt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(testimonial)}
                          className="text-neon-blue hover:text-neon-blue hover:bg-neon-blue/10 h-8 w-8 p-0"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(testimonial.id)}
                          disabled={deleteMutation.isPending}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {testimonials.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p>Belum ada testimoni. Tambahkan testimoni pertama!</p>
        </div>
      )}

      {/* Testimonial Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="bg-card border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-gradient text-xl">
              {editingTestimonial ? 'Edit Testimoni' : 'Tambah Testimoni'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nama</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nama pelanggan"
                className="bg-input/30 border-white/10 focus:border-neon-blue/50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Testimoni</Label>
              <Textarea
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                placeholder="Tulis testimoni pelanggan..."
                className="bg-input/30 border-white/10 focus:border-neon-blue/50 min-h-20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setForm({ ...form, rating: i + 1 })}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        i < form.rating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Avatar URL (opsional)</Label>
              <Input
                value={form.avatar}
                onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
                className="bg-input/30 border-white/10 focus:border-neon-blue/50"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={closeForm}
                className="text-muted-foreground"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-neon-blue to-neon-purple hover:opacity-90 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : editingTestimonial ? (
                  'Simpan Perubahan'
                ) : (
                  'Tambah Testimoni'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
