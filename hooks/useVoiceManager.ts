"use client"

import { useState, useRef, useCallback } from "react"

interface VoiceManagerState {
  currentlyPlaying: string | null
  isPaused: boolean
}

export function useVoiceManager() {
  const [state, setState] = useState<VoiceManagerState>({
    currentlyPlaying: null,
    isPaused: false,
  })

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const speak = useCallback((text: string, messageId: string) => {
    // Stop any currently playing speech
    if (utteranceRef.current) {
      speechSynthesis.cancel()
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1

    utterance.onstart = () => {
      setState({
        currentlyPlaying: messageId,
        isPaused: false,
      })
    }

    utterance.onend = () => {
      setState({
        currentlyPlaying: null,
        isPaused: false,
      })
      utteranceRef.current = null
    }

    utterance.onerror = () => {
      setState({
        currentlyPlaying: null,
        isPaused: false,
      })
      utteranceRef.current = null
    }

    utteranceRef.current = utterance
    speechSynthesis.speak(utterance)
  }, [])

  const pause = useCallback(() => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause()
      setState((prev) => ({ ...prev, isPaused: true }))
    }
  }, [])

  const resume = useCallback(() => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume()
      setState((prev) => ({ ...prev, isPaused: false }))
    }
  }, [])

  const stop = useCallback(() => {
    speechSynthesis.cancel()
    setState({
      currentlyPlaying: null,
      isPaused: false,
    })
    utteranceRef.current = null
  }, [])

  return {
    ...state,
    speak,
    pause,
    resume,
    stop,
  }
}
