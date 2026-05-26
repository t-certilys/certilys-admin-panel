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

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCommandPalette } from "@/components/providers/command-provider"

export function QuickCreateDialog() {
  const { isQuickCreateOpen, setIsQuickCreateOpen } = useCommandPalette()

  return (
    <Dialog open={isQuickCreateOpen} onOpenChange={setIsQuickCreateOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={AddCircleIcon} size={20} strokeWidth={1.5} className="text-primary" />
            Quick Create
          </DialogTitle>
          <DialogDescription>
            Create a new resource quickly. Choose the type below.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-6 py-6">
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
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsQuickCreateOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setIsQuickCreateOpen(false)}>
            Create Resource
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
