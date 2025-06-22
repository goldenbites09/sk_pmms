import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-white border-b sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center">
          <Link href="/" className="flex items-center gap-2 mb-2 md:mb-0">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame_2-lOeKuJzXYmZy6Kdr9KVjRiinmcMExo.png"
              alt="PMMS Logo"
              className="h-8"
            />
            <span className="text-xl font-bold text-emerald-600">SK Monitor</span>
          </Link>

          <div className="flex flex-col md:flex-row gap-2 md:gap-4">
            <Link href="/login">
              <Button variant="outline" className="w-full md:w-auto">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button className="w-full md:w-auto">Sign Up</Button>
            </Link>
          </div>
        </div>

      </header>
      <main className="flex-1">
        <section className="relative py-12 md:py-24 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Bg_1-gJscCuw8IWiwtUX1bwRD3UR8s8gQvg.png"
              alt="SK San Francisco Background"
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/90 to-emerald-800/90"></div>
          </div>
          <div className="container relative z-10 px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4 text-white">
                <div className="inline-block">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image_4-PNuegjThiFoH8dOdfpyFI2evDaCKSZ.png"
                    alt="SK San Francisco Logo"
                    className="h-24 w-24 mb-4"
                  />
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  SK Program Monitoring System
                </h1>
                <p className="md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed opacity-90">
                  A comprehensive solution for SK Officials to manage programs, track expenses, and generate reports.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/register">
                    <Button className="w-full min-[400px]:w-auto bg-white text-emerald-800 hover:bg-gray-100">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button
                      variant="outline"
                      className="w-full min-[400px]:w-auto border-white text-emerald-800 hover:bg-gray-100"
                    >
                      Sign In
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="mx-auto lg:ml-auto flex justify-center">
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20 shadow-xl">
                  <img
                    alt="SK Program Monitoring"
                    className="rounded-lg object-cover"
                    height="300"
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Bg_1-gJscCuw8IWiwtUX1bwRD3UR8s8gQvg.png"
                    width="500"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Key Features</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need to manage SK programs efficiently
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Program Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Create, update, and track SK programs with detailed information and participant lists.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Expense Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Monitor all expenses related to programs with detailed categorization and reporting.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Participant Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Keep track of program participants with comprehensive profiles and attendance records.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Role-Based Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Different access levels for SK Officials and general viewers to ensure data security.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Reporting</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Generate comprehensive reports on programs, expenses, and participant engagement.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>User-Friendly Interface</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Modern, intuitive design that makes program monitoring simple and efficient.</p>
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
            <p className="text-sm">© 2025 SK Program Monitoring System. All rights reserved.</p>
          </div>
          <nav className="flex gap-4 sm:gap-6">
            <Link className="text-sm hover:underline" href="#">
              Terms of Service
            </Link>
            <Link className="text-sm hover:underline" href="#">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
