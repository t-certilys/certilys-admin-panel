"use client"

import * as React from "react"
import {
  AddCircleIcon,
  FileAddIcon,
  FolderAddIcon,
  UserAddIcon,
  Tag01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { AppDialog } from "@/components/certilys-ui/dialogs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCommandPalette } from "@/components/providers/command-provider"

export function QuickCreateDialog() {
  const { isQuickCreateOpen, setIsQuickCreateOpen } = useCommandPalette()

  return (
    <AppDialog
      open={isQuickCreateOpen}
      onOpenChange={setIsQuickCreateOpen}
      size="md"
      title={
        <span className="flex items-center gap-2">
          <HugeiconsIcon icon={AddCircleIcon} size={20} strokeWidth={1.5} className="text-primary" />
          Quick Create
        </span>
      }
      description="Create a new resource quickly. Choose the type below."
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => setIsQuickCreateOpen(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={() => setIsQuickCreateOpen(false)} className="w-full sm:w-auto">
            Create Resource
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-20 flex-col gap-2 rounded-xl border-dashed">
            <HugeiconsIcon icon={FileAddIcon} size={24} strokeWidth={1.5} />
            <span className="text-xs">Document</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2 rounded-xl border-dashed">
            <HugeiconsIcon icon={FolderAddIcon} size={24} strokeWidth={1.5} />
            <span className="text-xs">Folder</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2 rounded-xl border-dashed">
            <HugeiconsIcon icon={UserAddIcon} size={24} strokeWidth={1.5} />
            <span className="text-xs">Member</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2 rounded-xl border-dashed">
            <HugeiconsIcon icon={Tag01Icon} size={24} strokeWidth={1.5} />
            <span className="text-xs">Tag</span>
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Quick Title</Label>
            <Input id="name" placeholder="Enter title..." />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Quick Note</Label>
            <Textarea id="description" placeholder="A short description..." className="h-24 resize-none" />
          </div>
        </div>
      </div>
    </AppDialog>
  )
}
