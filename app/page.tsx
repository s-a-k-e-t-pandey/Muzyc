import AppBar from "./components/AppBar"
import Link from "next/link"

export default function Home() {
  return (
    <div className="bg-[#0d1117] text-white">
      <header className="px-4 lg:px-6 h-14 flex items-center justify-between">
        <AppBar></AppBar>
      </header>
      <main>
        <section className="w-full h-[80vh] relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d1117] to-[#0d1117]/50 z-10" />
          <video src="/hero-video.mp4" autoPlay loop muted className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-4 md:px-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">Let Your Fans Choose the Music</h1>
            <p className="max-w-[600px] text-lg md:text-xl text-muted-foreground mt-4">
              Tune In is the ultimate music streaming platform for creators to let their fans control the music on their
              live streams.
            </p>
            <div className="mt-8">
              <Link
                href="#"
                className="inline-flex h-10 items-center justify-center rounded-md bg-[#00b894] px-8 text-sm font-medium text-[#0d1117] shadow transition-colors hover:bg-[#00b894]/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                prefetch={false}
              >
                Sign Up as a Creator
              </Link>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-[#161b22]">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Featured Creators</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Check out some of the top creators on Tune In and let their fans choose the music.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="rounded-full bg-[#00b894] w-24 h-24 flex items-center justify-center text-4xl">🎤</div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold">DJ Beats</h3>
                  <p className="text-muted-foreground">Electronic Music</p>
                </div>
                <Link
                  href="#"
                  className="inline-flex h-9 items-center justify-center rounded-md bg-[#00b894] px-4 py-2 text-sm font-medium text-[#0d1117] shadow transition-colors hover:bg-[#00b894]/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  prefetch={false}
                >
                  View Stream
                </Link>
              </div>
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="rounded-full bg-[#00b894] w-24 h-24 flex items-center justify-center text-4xl">🎸</div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold">Rock Legends</h3>
                  <p className="text-muted-foreground">Rock Music</p>
                </div>
                <Link
                  href="#"
                  className="inline-flex h-9 items-center justify-center rounded-md bg-[#00b894] px-4 py-2 text-sm font-medium text-[#0d1117] shadow transition-colors hover:bg-[#00b894]/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  prefetch={false}
                >
                  View Stream
                </Link>
              </div>
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="rounded-full bg-[#00b894] w-24 h-24 flex items-center justify-center text-4xl">🎹</div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold">Piano Prodigy</h3>
                  <p className="text-muted-foreground">Classical Music</p>
                </div>
                <Link
                  href="#"
                  className="inline-flex h-9 items-center justify-center rounded-md bg-[#00b894] px-4 py-2 text-sm font-medium text-[#0d1117] shadow transition-colors hover:bg-[#00b894]/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  prefetch={false}
                >
                  View Stream
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-[#161b22]">
        <p className="text-xs text-muted-foreground">&copy; 2024 Tune In. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4 text-[#00b894]" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4 text-[#00b894]" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
