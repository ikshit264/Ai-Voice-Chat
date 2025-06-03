"use client"

import { useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import type { ChatTemplate } from "@/types/settings"
import { PlusCircle, Edit, Trash } from "lucide-react"

interface TemplateManagerProps {
  userId: string
  onTemplateSelect: (templateId: string) => void
  selectedTemplateId?: string
}

export default function TemplateManager({ userId, onTemplateSelect, selectedTemplateId }: TemplateManagerProps) {
  const [templates, setTemplates] = useState<ChatTemplate[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentTemplate, setCurrentTemplate] = useState<Partial<ChatTemplate>>({
    name: "",
    description: "",
    systemPrompt: "",
  })
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    loadTemplates()
  }, [userId])

  const loadTemplates = () => {
    const savedTemplates = localStorage.getItem(`chat-templates-${userId}`)
    if (savedTemplates) {
      try {
        const parsed = JSON.parse(savedTemplates)
        setTemplates(parsed)
      } catch (error) {
        console.error("Failed to parse templates:", error)
        setTemplates([])
      }
    } else {
      // Create default template if none exist
      const defaultTemplate: ChatTemplate = {
        id: "default",
        name: "General Assistant",
        description: "A helpful AI assistant for general questions",
        systemPrompt:
          "You are a helpful AI assistant. Respond to the user's message in a conversational and friendly manner.",
        createdAt: new Date(),
        updatedAt: new Date(),
        userId,
        isDefault: true,
      }
      setTemplates([defaultTemplate])
      saveTemplates([defaultTemplate])
    }
  }

  const saveTemplates = (updatedTemplates: ChatTemplate[]) => {
    localStorage.setItem(`chat-templates-${userId}`, JSON.stringify(updatedTemplates))
  }

  const handleCreateTemplate = () => {
    setIsEditing(false)
    setCurrentTemplate({
      name: "",
      description: "",
      systemPrompt:
        "You are a helpful AI assistant. Respond to the user's message in a conversational and friendly manner.",
    })
    setIsDialogOpen(true)
  }

  const handleEditTemplate = (template: ChatTemplate) => {
    setIsEditing(true)
    setCurrentTemplate({ ...template })
    setIsDialogOpen(true)
  }

  const handleDeleteTemplate = (templateId: string) => {
    const updatedTemplates = templates.filter((t) => t.id !== templateId)
    setTemplates(updatedTemplates)
    saveTemplates(updatedTemplates)
    toast({
      title: "Template deleted",
      description: "The template has been removed",
    })

    // If the deleted template was selected, select the first available template
    if (templateId === selectedTemplateId && updatedTemplates.length > 0) {
      onTemplateSelect(updatedTemplates[0].id)
    }
  }

  const handleSetDefault = (templateId: string) => {
    const updatedTemplates = templates.map((t) => ({
      ...t,
      isDefault: t.id === templateId,
    }))
    setTemplates(updatedTemplates)
    saveTemplates(updatedTemplates)
    onTemplateSelect(templateId)
    toast({
      title: "Default template updated",
      description: "This template will be used for new chats",
      variant: "success",
    })
  }

  const handleSaveTemplate = () => {
    if (!currentTemplate.name || !currentTemplate.systemPrompt) {
      toast({
        title: "Missing information",
        description: "Please provide a name and system prompt",
        variant: "destructive",
      })
      return
    }

    let updatedTemplates: ChatTemplate[]
    const now = new Date()

    if (isEditing && currentTemplate.id) {
      // Update existing template
      updatedTemplates = templates.map((t) =>
        t.id === currentTemplate.id
          ? {
              ...t,
              name: currentTemplate.name!,
              description: currentTemplate.description || "",
              systemPrompt: currentTemplate.systemPrompt!,
              updatedAt: now,
            }
          : t,
      )
      toast({
        title: "Template updated",
        description: "Your changes have been saved",
      })
    } else {
      // Create new template
      const newTemplate: ChatTemplate = {
        id: `template-${Date.now()}`,
        name: currentTemplate.name!,
        description: currentTemplate.description || "",
        systemPrompt: currentTemplate.systemPrompt!,
        createdAt: now,
        updatedAt: now,
        userId,
        isDefault: templates.length === 0, // Make default if it's the first template
      }
      updatedTemplates = [...templates, newTemplate]
      toast({
        title: "Template created",
        description: "Your new template is ready to use",
      })
    }

    setTemplates(updatedTemplates)
    saveTemplates(updatedTemplates)
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Chat Templates</h3>
        <button
          onClick={handleCreateTemplate}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
        >
          <PlusCircle className="w-4 h-4" />
          New Template
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No templates yet. Create your first template to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`p-4 rounded-lg border ${
                template.id === selectedTemplateId ? "border-blue-500 bg-blue-50" : "border-gray-200"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    {template.name}
                    {template.isDefault && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">Default</span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditTemplate(template)}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Edit template"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="text-gray-400 hover:text-red-600"
                    aria-label="Delete template"
                    disabled={templates.length === 1} // Prevent deleting the last template
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => onTemplateSelect(template.id)}
                  className={`px-3 py-1 text-xs rounded-full ${
                    template.id === selectedTemplateId
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Use Template
                </button>
                {!template.isDefault && (
                  <button
                    onClick={() => handleSetDefault(template.id)}
                    className="px-3 py-1 text-xs rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
                  >
                    Set as Default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Template" : "Create New Template"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Template Name
              </label>
              <input
                id="name"
                value={currentTemplate.name}
                onChange={(e) => setCurrentTemplate({ ...currentTemplate, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., Technical Assistant"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description (optional)
              </label>
              <input
                id="description"
                value={currentTemplate.description}
                onChange={(e) => setCurrentTemplate({ ...currentTemplate, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., Specialized in technical questions"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="systemPrompt" className="text-sm font-medium">
                System Prompt
              </label>
              <textarea
                id="systemPrompt"
                value={currentTemplate.systemPrompt}
                onChange={(e) => setCurrentTemplate({ ...currentTemplate, systemPrompt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md h-32"
                placeholder="Instructions for the AI model..."
              />
              <p className="text-xs text-gray-500">This prompt will guide how the AI responds to user messages.</p>
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setIsDialogOpen(false)}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveTemplate}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {isEditing ? "Update Template" : "Create Template"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
