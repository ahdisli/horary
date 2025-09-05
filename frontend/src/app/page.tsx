import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex flex-col items-center sm:items-start gap-4">
          <h1 className="text-4xl font-bold tracking-tight">Horary Astrology App</h1>
          <p className="text-xl text-muted-foreground text-center sm:text-left max-w-2xl">
            Experience the power of AI-driven horary astrology consultations with voice interaction
          </p>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Link
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="/voice"
          >
            <span>🎤</span>
            Try Voice Interface
          </Link>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://github.com/ahdisli/horary"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </a>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-8">
          <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
            <h3 className="font-semibold mb-2">🎯 Real-time Voice</h3>
            <p className="text-sm text-muted-foreground">
              Natural speech-to-speech interaction using OpenAI Realtime API with WebRTC
            </p>
          </div>
          
          <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
            <h3 className="font-semibold mb-2">🔮 Horary Astrology</h3>
            <p className="text-sm text-muted-foreground">
              Traditional horary techniques with AI-powered chart interpretation
            </p>
          </div>
          
          <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
            <h3 className="font-semibold mb-2">⚡ Low Latency</h3>
            <p className="text-sm text-muted-foreground">
              Sub-second response times with WebRTC peer-to-peer connections
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
