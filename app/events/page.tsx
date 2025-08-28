"use client"

import { Calendar, MapPin, Clock, CalendarDays, Grid3X3, Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import Link from "next/link"
import { useState, useMemo } from "react"

const events = [
  {
    id: 1,
    title: "75th Anniversary Celebration Balya Bhavan",
    description: "Join us for a grand celebration of 75 years of excellence and memories.",
    date: "Sunday, 9th November",
    time: "9 AM - 6 PM",
    location: "Balya Bhavan",
    attendees: 250,
    maxAttendees: 300,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Creating%20Connections%20Through%20Abstract%20Figures-fSl03d5YQZ6shMke3mk6xxB5b9aoub.png",
    status: "upcoming",
    featured: true,
    category: "celebration",
  },
  {
    id: 2,
    title: "Alumni Reunion Lunch",
    description: "Reconnect with old friends and make new memories over a delicious lunch.",
    date: "Sunday, 9th November",
    time: "12:00 PM - 3:00 PM",
    location: "Balya Bhavan",
    attendees: 180,
    maxAttendees: 200,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Aug%2026%2C%202025%2C%2007_02_24%20PM-hUQnJehLbkZTLBkLE1jDWPZSkW2yiX.png",
    status: "upcoming",
    featured: false,
    category: "social",
  },
  {
    id: 3,
    title: "Cultural Evening",
    description: "Experience traditional performances and cultural programs by alumni.",
    date: "Sunday, 9th November",
    time: "5:00 PM - 9:00 PM",
    location: "Open Air Theatre",
    attendees: 120,
    maxAttendees: 400,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Aug%2026%2C%202025%2C%2007_08_41%20PM-9P9XYZe0hGwPzIJfjTydjGWU4gVCmA.png",
    status: "upcoming",
    featured: false,
    category: "cultural",
  },
  {
    id: 6,
    title: "Alumni Networking Mixer",
    description: "Connect with fellow alumni across different industries and build lasting relationships.",
    date: "Sunday, 9th November",
    time: "6:30 PM - 9:30 PM",
    location: "Rooftop Lounge",
    attendees: 85,
    maxAttendees: 120,
    image: "/networking-event-professional-gathering.png",
    status: "upcoming",
    featured: false,
    category: "networking",
  },
]

export default function EventsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "calendar">("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("date")

  const filteredAndSortedEvents = useMemo(() => {
    const filtered = events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || event.category === selectedCategory
      return matchesSearch && matchesCategory
    })

    // Sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case "title":
          return a.title.localeCompare(b.title)
        case "attendees":
          return b.attendees - a.attendees
        default:
          return 0
      }
    })

    return filtered
  }, [searchTerm, selectedCategory, sortBy])

  const CalendarView = () => {
    const eventsByDate = filteredAndSortedEvents.reduce(
      (acc, event) => {
        const date = new Date(event.date).toDateString()
        if (!acc[date]) acc[date] = []
        acc[date].push(event)
        return acc
      },
      {} as Record<string, typeof events>,
    )

    const sortedDates = Object.keys(eventsByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

    return (
      <div className="space-y-6">
        {sortedDates.map((date) => (
          <div key={date} className="bg-white/5 border-white/10 backdrop-blur-lg rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              {new Date(date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h3>
            <div className="grid gap-4">
              {eventsByDate[date].map((event) => (
                <div key={event.id} className="bg-white/5 rounded-lg p-4 flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={event.image || "/placeholder.svg"}
                      alt={event.title}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{event.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-white/70 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {event.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </span>
                    </div>
                  </div>
                  {event.id === 1 ? (
                    <Link href={`/register/${event.id}`}>
                      <Button size="sm" className="bg-white text-black hover:bg-white/90">
                        Register
                      </Button>
                    </Link>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="relative z-10 min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute -inset-6 rounded-2xl bg-gradient-to-br from-indigo-500/15 via-fuchsia-500/10 to-transparent blur-2xl"></div>
              <div className="relative w-16 h-16 ring-1 ring-white/10 flex bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 rounded-xl shadow-md items-center justify-center overflow-hidden">
                <Image
                  src="/images/balya-logo.png"
                  alt="Balya Bhavan Logo"
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif mb-4">Alumni Events</h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Join us for memorable events celebrating our rich heritage and strong community bonds.
          </p>

          {/* View toggle buttons */}
          <div className="flex justify-center mt-6 gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              onClick={() => setViewMode("grid")}
              className={
                viewMode === "grid"
                  ? "bg-white text-black hover:bg-white/90"
                  : "border-white/20 text-white hover:bg-white/10 bg-transparent"
              }
            >
              <Grid3X3 className="w-4 h-4 mr-2" />
              Grid View
            </Button>
            <Button
              variant={viewMode === "calendar" ? "default" : "outline"}
              onClick={() => setViewMode("calendar")}
              className={
                viewMode === "calendar"
                  ? "bg-white text-black hover:bg-white/90"
                  : "border-white/20 text-white hover:bg-white/10 bg-transparent"
              }
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              Calendar View
            </Button>
          </div>
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/50"
              />
            </div>
            <div className="flex gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="celebration">Celebration</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="cultural">Cultural</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="networking">Networking</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="attendees">Popularity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="text-white/60 text-sm">
            Showing {filteredAndSortedEvents.length} of {events.length} events
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredAndSortedEvents.map((event) => (
              <Card
                key={event.id}
                className={`bg-white/5 border-white/10 backdrop-blur-lg hover:bg-white/10 transition-all duration-300 ${
                  event.featured ? "md:col-span-2 lg:col-span-2" : ""
                }`}
              >
                <div className="relative">
                  <Image
                    src={event.image || "/placeholder.svg"}
                    alt={event.title}
                    width={event.featured ? 800 : 400}
                    height={200}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  {event.featured && (
                    <Badge className="absolute top-4 left-4 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white">
                      Featured Event
                    </Badge>
                  )}
                  <Badge className="absolute top-4 right-4 bg-white/20 text-white capitalize">{event.category}</Badge>
                </div>

                <CardHeader>
                  <CardTitle className="text-white text-xl">{event.title}</CardTitle>
                  <CardDescription className="text-white/70">{event.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Calendar className="w-4 h-4" />
                    {event.date}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Clock className="w-4 h-4" />
                    {event.time}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </div>
                </CardContent>

                <CardFooter>
                  {event.id === 1 && (
                    <Link href={`/register/${event.id}`} className="w-full">
                      <Button className="w-full bg-white text-black hover:bg-white/90 transition-colors">
                        Register Now
                      </Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <CalendarView />
        )}

        {/* Navigation */}
        <div className="flex justify-center mt-12 gap-4">
          <Link href="/">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
              Back to Login
            </Button>
          </Link>
          <Link href="/profile">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
              View Profile
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
