import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-white border-b fixed top-0 w-full z-50 shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3 flex justify-between items-center">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/" className="flex items-center gap-1 sm:gap-2">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame_2-lOeKuJzXYmZy6Kdr9KVjRiinmcMExo.png"
                alt="PMMS Logo"
                className="h-6 sm:h-8"
              />
              <span className="text-base sm:text-xl font-bold text-emerald-700">SK Monitor</span>
            </Link>
            <Link href="#features">
              <Button
                variant="ghost"
                className="px-3 sm:px-4 h-8 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 font-semibold border border-emerald-200 hover:border-emerald-300"
              >
                Features
              </Button>
            </Link>
          </div>
          <div className="flex gap-2 sm:gap-4">
            <Link href="/login">
              <Button
                variant="outline"
                className="px-3 sm:px-4 h-8 border-emerald-600 text-emerald-700 hover:bg-emerald-50 bg-transparent"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="px-3 sm:px-4 h-8 bg-emerald-600 hover:bg-emerald-700">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-[3rem] sm:pt-[3.5rem]">
        <section className="relative py-12 md:py-24 lg:py-32">
          <div className="absolute inset-0 z-0">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Bg_1-gJscCuw8IWiwtUX1bwRD3UR8s8gQvg.png"
              alt="SK San Francisco Background"
              className="w-full h-full object-cover opacity-15"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-700/95 to-emerald-900/95"></div>
          </div>
          <div className="container relative z-10 px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-6 text-white">
                <div className="inline-block">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image_4-PNuegjThiFoH8dOdfpyFI2evDaCKSZ.png"
                    alt="SK San Francisco Logo"
                    className="h-24 w-24 mb-4 drop-shadow-lg"
                  />
                </div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl text-white drop-shadow-lg">
                  SK Program Monitoring System
                </h1>
                <p className="text-lg md:text-xl lg:text-2xl text-emerald-50 drop-shadow-md font-medium leading-relaxed">
                  A comprehensive solution for SK Officials to manage programs, track expenses, and generate reports.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link href="/register">
                    <Button
                      size="lg"
                      className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold px-8 py-3 text-lg shadow-lg"
                    >
                      Get Started
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-2 border-white text-white hover:bg-white hover:text-emerald-700 font-semibold px-8 py-3 text-lg bg-transparent"
                    >
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="mx-auto lg:ml-auto flex justify-center">
                <div className="bg-white/15 backdrop-blur-sm p-6 rounded-xl border border-white/30 shadow-2xl">
                  <img
                    alt="SK Program Monitoring"
                    className="rounded-lg object-cover shadow-lg"
                    height="300"
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Bg_1-gJscCuw8IWiwtUX1bwRD3UR8s8gQvg.png"
                    width="500"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-12 md:py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-gray-900">
                  Key Features
                </h2>
                <p className="max-w-[900px] text-gray-700 md:text-xl lg:text-2xl font-medium leading-relaxed">
                  Everything you need to manage SK programs efficiently
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-2 border-emerald-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900">Program Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 font-medium leading-relaxed">
                    Create, update, and track SK programs with detailed information and participant lists.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-emerald-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900">Expense Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 font-medium leading-relaxed">
                    Monitor all expenses related to programs with detailed categorization and reporting.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-emerald-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900">Participant Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 font-medium leading-relaxed">
                    Keep track of program participants with comprehensive profiles and attendance records.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-emerald-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900">Role-Based Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 font-medium leading-relaxed">
                    Different access levels for SK Officials and general viewers to ensure data security.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-emerald-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900">Reporting</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 font-medium leading-relaxed">
                    Generate comprehensive reports on programs, expenses, and participant engagement.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-emerald-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900">User-Friendly Interface</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 font-medium leading-relaxed">
                    Modern, intuitive design that makes program monitoring simple and efficient.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 md:py-8 bg-emerald-800 text-white">
        <div className="container mx-auto px-4 flex flex-col gap-2 sm:flex-row justify-between">
          <div className="flex items-center gap-2">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image_4-PNuegjThiFoH8dOdfpyFI2evDaCKSZ.png"
              alt="SK San Francisco Logo"
              className="h-10 w-10"
            />
            <p className="text-sm font-medium text-emerald-50">
              © 2025 SK Program Monitoring System. All rights reserved.
            </p>
          </div>
          <nav className="flex gap-4 sm:gap-6">
            <Link className="text-sm hover:underline text-emerald-100 hover:text-white font-medium" href="#">
              Terms of Service
            </Link>
            <Link className="text-sm hover:underline text-emerald-100 hover:text-white font-medium" href="#">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
