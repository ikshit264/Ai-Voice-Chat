"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, MicOff, Square } from "lucide-react"

interface VoiceRecorderProps {
  onTranscript: (text: string) => void
  disabled?: boolean
}

export default function VoiceRecorder({ onTranscript, disabled }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isSupported, setIsSupported] = useState(true)
  const recognitionRef = useRef<any>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (!SpeechRecognition) {
        setIsSupported(false)
        return
      }

      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = "en-US"

      recognition.onresult = (event: any) => {
        let finalTranscript = ""
        let interimTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        const currentTranscript = finalTranscript || interimTranscript
        setTranscript(currentTranscript)

        // Auto-stop after 3 seconds of silence
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        if (finalTranscript) {
          timeoutRef.current = setTimeout(() => {
            stopRecording()
          }, 3000)
        }
      }

      recognition.onend = () => {
        setIsRecording(false)
        if (transcript.trim()) {
          onTranscript(transcript.trim())
          setTranscript("")
        }
      }

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        setIsRecording(false)
        setTranscript("")
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [transcript, onTranscript])

  const startRecording = async () => {
    if (!recognitionRef.current || isRecording || disabled) return

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true })

      setTranscript("")
      recognitionRef.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Failed to start recording:", error)
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }

  if (!isSupported) {
    return (
      <button disabled className="p-3 rounded-full bg-gray-100 text-gray-400 cursor-not-allowed">
        <MicOff className="w-5 h-5" />
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled}
        className={`p-3 rounded-full transition-all duration-200 ${
          isRecording
            ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
      >
        {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>

      {transcript && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {transcript.slice(0, 30)}...
        </div>
      )}
    </div>
  )
}
