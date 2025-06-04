"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, MicOff, Square } from "lucide-react"

// Add type definitions at the top of the file
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
  error: string;
  message?: string;
  name?: string;
  path?: EventTarget[];
  timeStamp: number;
  bubbles: boolean;
  cancelable: boolean;
  composed: boolean;
  defaultPrevented: boolean;
  eventPhase: number;
  isTrusted: boolean;
  returnValue: boolean;
  srcElement: EventTarget | null;
  target: EventTarget | null;
  currentTarget: EventTarget | null;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface VoiceRecorderProps {
  onTranscript: (text: string) => void
  disabled?: boolean
}

export default function VoiceRecorder({ onTranscript, disabled }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isMicOn, setIsMicOn] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isSupported, setIsSupported] = useState(true)
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [retryCount, setRetryCount] = useState(0)
  const [isInitializing, setIsInitializing] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const recognitionRef = useRef<any>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const maxRetries = 3
  const recognitionTimeout = 5000
  const retryDelay = 2000

  // Add network check function
  const checkNetworkConnection = async () => {
    try {
      const response = await fetch('https://www.google.com', { 
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      })
      return true
    } catch (error) {
      return false
    }
  }

  // Add debug logging function with timestamp
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    console.log(`[VoiceRecorder Debug ${timestamp}] ${message}`)
    setDebugInfo(prev => [...prev, `${timestamp}: ${message}`])
  }

  // Add browser detection helper
  const isMobileBrowser = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
  }

  // Add secure context check helper
  const checkSecureContext = () => {
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1'
    const isSecure = window.location.protocol === 'https:'
    const isMobile = isMobileBrowser()

    return {
      isSecure,
      isLocalhost,
      isMobile,
      isAllowed: isSecure || isLocalhost
    }
  }

  // Toggle microphone state
  const toggleMicrophone = async () => {
    if (disabled || isInitializing) {
      addDebugLog(`Cannot toggle microphone: ${disabled ? 'Disabled' : 'Initializing'}`)
      return
    }

    if (isMicOn) {
      // Turn off microphone
      stopRecording()
      setIsMicOn(false)
      addDebugLog("Microphone turned OFF")
    } else {
      // Turn on microphone
      try {
        setIsInitializing(true)
        
        // Check secure context with detailed logging
        const context = checkSecureContext()
        addDebugLog(`Context check: ${JSON.stringify(context, null, 2)}`)

        if (!context.isAllowed) {
          const errorMsg = context.isMobile 
            ? "Speech recognition requires HTTPS on mobile browsers. Please use HTTPS or switch to a desktop browser."
            : "Speech recognition requires a secure context (HTTPS) or localhost"
          addDebugLog(errorMsg)
          throw new Error(errorMsg)
        }

        // Additional mobile browser warning
        if (context.isMobile) {
          addDebugLog("Mobile browser detected. Some features might be limited.")
        }

        // Check network connection with more details
        const isConnected = await checkNetworkConnection()
        if (!isConnected) {
          throw new Error("No internet connection available")
        }

        // Log network details
        const networkInfo = {
          online: navigator.onLine,
          connectionType: (navigator as any).connection?.type || 'unknown',
          effectiveType: (navigator as any).connection?.effectiveType || 'unknown',
          downlink: (navigator as any).connection?.downlink || 'unknown',
          rtt: (navigator as any).connection?.rtt || 'unknown'
        }
        addDebugLog(`Network details: ${JSON.stringify(networkInfo, null, 2)}`)

        addDebugLog("Requesting microphone permission")
        
        // Request microphone access with more specific constraints
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,  // Mono audio
            sampleRate: 16000 // Standard sample rate
          } 
        })

        if (!stream.active) {
          throw new Error("Audio stream is not active")
        }

        // Stop the stream after getting permission
        stream.getTracks().forEach(track => track.stop())
        
        addDebugLog("Microphone permission granted")

        // Initialize recognition with mobile-specific settings
        const recognition = initializeRecognition()
        if (!recognition) {
          throw new Error("Failed to initialize speech recognition")
        }

        // Configure recognition based on device type
        if (context.isMobile) {
          recognition.continuous = false  // Disable continuous mode on mobile
          recognition.maxAlternatives = 1 // Reduce alternatives on mobile
        }

        recognitionRef.current = recognition
        setRetryCount(0)
        recognition.start()
        setIsMicOn(true)
        addDebugLog("Microphone turned ON")
        
      } catch (error: unknown) {
        const initError = error as Error
        addDebugLog(`Failed to initialize microphone: ${initError.message}`)
        console.error("Microphone initialization error:", initError)
        setIsMicOn(false)

        // Show user-friendly error message
        if (initError.message.includes('HTTPS')) {
          addDebugLog("Please use HTTPS or switch to a desktop browser for better compatibility")
        }
      } finally {
        setIsInitializing(false)
      }
    }
  }

  // Update cleanup to handle mic state
  const cleanup = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
        recognitionRef.current = null
      } catch (error) {
        console.error("Error cleaning up recognition:", error)
      }
    }
    setIsMicOn(false)
    setIsRecording(false)
  }

  // Add retry logic with proper state management
  const retryRecording = async () => {
    if (retryCount >= maxRetries || isRetrying) {
      addDebugLog("Maximum retry attempts reached or retry in progress")
      setRetryCount(0)
      setIsRetrying(false)
      return
    }

    setIsRetrying(true)
    const currentRetry = retryCount + 1
    addDebugLog(`Retrying recording (attempt ${currentRetry} of ${maxRetries})...`)
    
    // Wait for retry delay
    await new Promise(resolve => {
      retryTimeoutRef.current = setTimeout(resolve, retryDelay)
    })

    // Check network before retrying
    const isConnected = await checkNetworkConnection()
    if (!isConnected) {
      addDebugLog("No internet connection available. Please check your network.")
      setIsRetrying(false)
      return
    }

    // Cleanup previous instance
    cleanup()

    // Update retry count
    setRetryCount(currentRetry)

    // Reinitialize and start recording
    try {
      const recognition = initializeRecognition()
      if (!recognition) {
        throw new Error("Failed to initialize speech recognition")
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch (error: unknown) {
      if (error instanceof Error) {
        addDebugLog(`Retry failed: ${error.message}`)
      } else {
        addDebugLog(`Retry failed: ${String(error)}`)
      }
      setIsRetrying(false)
    }
  }

  // Initialize recognition with more reliable settings
  const initializeRecognition = () => {
    if (typeof window === "undefined") return null

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognition) {
        addDebugLog("Speech Recognition is not supported in this browser")
        setIsSupported(false)
        return null
      }

      const recognition = new SpeechRecognition()
      
      // Configure with more secure and reliable settings
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = "en-US"
      recognition.maxAlternatives = 1

      // Add error handling for COOP restrictions
      recognition.onerror = (event: SpeechRecognitionEvent) => {
        const error = event.error
        const errorMessage = event.message || ''
        
        // Create detailed error log object
        const errorDetails = {
          timestamp: new Date().toISOString(),
          error: event.error,
          message: event.message,
          name: event.name,
          type: event.type,
          timeStamp: event.timeStamp,
          location: {
            url: window.location.href,
            protocol: window.location.protocol,
            hostname: window.location.hostname,
            pathname: window.location.pathname
          },
          browser: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            vendor: navigator.vendor
          },
          network: {
            online: navigator.onLine,
            connectionType: (navigator as any).connection?.type,
            effectiveType: (navigator as any).connection?.effectiveType
          },
          stack: new Error().stack
        }

        console.error("Speech recognition detailed error:", errorDetails)
        
        // Handle COOP specific errors
        if (error === 'network' && errorMessage.includes('Cross-Origin-Opener-Policy')) {
          addDebugLog(`Security policy restriction detected at ${errorDetails.location.url}`)
          addDebugLog(`Browser: ${errorDetails.browser.userAgent}`)
          addDebugLog(`Network Status: ${errorDetails.network.online ? 'Online' : 'Offline'}`)
          setIsRecording(false)
          cleanup()
          return
        }

        // Handle other errors with detailed logging
        if (error === 'network') {
          addDebugLog("Network error detected with details:")
          addDebugLog(`Time: ${errorDetails.timestamp}`)
          addDebugLog(`Location: ${errorDetails.location.url}`)
          addDebugLog(`Browser: ${errorDetails.browser.userAgent}`)
          addDebugLog(`Network Status: ${errorDetails.network.online ? 'Online' : 'Offline'}`)
          addDebugLog(`Connection Type: ${errorDetails.network.connectionType || 'Unknown'}`)
          addDebugLog(`Error Stack: ${errorDetails.stack}`)
          addDebugLog("Possible causes:")
          addDebugLog("1. Unstable internet connection")
          addDebugLog("2. Firewall blocking the service")
          addDebugLog("3. VPN or proxy interference")
          addDebugLog("4. Security policy restrictions")
          addDebugLog("5. Browser compatibility issues")
          addDebugLog("Attempting to reconnect...")
          
          if (retryCount < maxRetries) {
            retryRecording()
          } else {
            setIsRecording(false)
            cleanup()
          }
        } else {
          addDebugLog(`Unexpected error: ${error} at ${errorDetails.timestamp}`)
          addDebugLog(`Location: ${errorDetails.location.url}`)
          addDebugLog(`Stack: ${errorDetails.stack}`)
          setIsRecording(false)
          cleanup()
        }
      }

      // Add connection state change listener
      window.addEventListener('online', () => {
        addDebugLog("Network connection restored")
      })

      window.addEventListener('offline', () => {
        addDebugLog("Network connection lost")
        if (isRecording) {
          addDebugLog("Stopping recording due to network loss")
          stopRecording()
        }
      })

      recognition.onstart = () => {
        addDebugLog("Speech recognition started")
        setIsRecording(true)
        setIsRetrying(false)
      }

      recognition.onend = () => {
        addDebugLog("Speech recognition ended")
        setIsRecording(false)
        setIsMicOn(false)
        cleanup()
      }

      recognition.onresult = (event: any) => {
        let finalTranscript = ""
        let interimTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
            addDebugLog(`Final transcript: ${transcript}`)
          } else {
            interimTranscript += transcript
            addDebugLog(`Interim transcript: ${transcript}`)
          }
        }

        const currentTranscript = finalTranscript || interimTranscript
        setTranscript(currentTranscript)

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        if (finalTranscript) {
          addDebugLog("Setting auto-stop timeout for 3 seconds")
          timeoutRef.current = setTimeout(() => {
            addDebugLog("Auto-stop triggered after silence")
            stopRecording()
          }, 3000)
        }
      }

      recognition.onnomatch = () => {
        addDebugLog("Speech recognition: No match found")
      }

      recognition.onaudiostart = () => {
        addDebugLog("Audio capturing started")
      }

      recognition.onaudioend = () => {
        addDebugLog("Audio capturing ended")
      }

      recognition.onsoundstart = () => {
        addDebugLog("Sound detected")
      }

      recognition.onsoundend = () => {
        addDebugLog("Sound ended")
      }

      recognition.onspeechstart = () => {
        addDebugLog("Speech started")
      }

      recognition.onspeechend = () => {
        addDebugLog("Speech ended")
      }

      return recognition
    } catch (error: unknown) {
      const initError = error as Error
      addDebugLog(`Failed to initialize speech recognition: ${initError.message}`)
      console.error("Recognition initialization error:", initError)
      return null
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [])

  const stopRecording = () => {
    if (recognitionRef.current) {
      addDebugLog("Manually stopping recording")
      try {
        recognitionRef.current.stop()
        setIsRecording(false)  // Update recording state
        cleanup()  // Clean up resources
      } catch (error: unknown) {
        const stopError = error as Error
        addDebugLog(`Error stopping recording: ${stopError.message}`)
        // Force cleanup even if stop fails
        cleanup()
        setIsRecording(false)
      }
    }
  }

  if (!isSupported) {
    return (
      <div className="relative">
        <button disabled className="p-3 rounded-full bg-gray-100 text-gray-400 cursor-not-allowed">
          <MicOff className="w-5 h-5" />
        </button>
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded whitespace-nowrap">
          Browser not supported
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={toggleMicrophone}
        disabled={disabled || isInitializing}
        className={`p-3 rounded-full transition-all duration-200 ${
          isMicOn
            ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
            : isInitializing
            ? "bg-gray-500 hover:bg-gray-600 text-white"
            : isRetrying
            ? "bg-yellow-500 hover:bg-yellow-600 text-white"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-label={isMicOn ? "Turn off microphone" : "Turn on microphone"}
      >
        {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
      </button>

      {/* Status indicator with mobile warning */}
      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
        {isMicOn ? "Microphone ON" : "Microphone OFF"}
        {isMobileBrowser() && !window.location.protocol.includes('https') && (
          <span className="ml-2 text-yellow-400">(Mobile: Use HTTPS)</span>
        )}
      </div>

      {/* Debug info panel */}
      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs p-2 rounded max-w-xs max-h-48 overflow-y-auto">
        <div className="font-bold mb-1">Debug Info:</div>
        {debugInfo.slice(-5).map((log, index) => (
          <div key={index} className="whitespace-normal break-words">
            {log}
          </div>
        ))}
        {isRetrying && (
          <div className="mt-1 text-yellow-400">
            Retrying... (Attempt {retryCount} of {maxRetries})
          </div>
        )}
        {isInitializing && (
          <div className="mt-1 text-blue-400">
            Initializing...
          </div>
        )}
      </div>

      {transcript && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {transcript.slice(0, 30)}...
        </div>
      )}
    </div>
  )
}
