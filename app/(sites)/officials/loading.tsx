import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="container py-10">
      <div className="mb-10">
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-4 w-[400px] mt-2" />
      </div>

      {/* Barangay Captain Skeleton */}
      <section className="mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Skeleton className="h-[500px] w-full rounded-xl" />
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-8 w-[300px]" />
            <Skeleton className="h-4 w-[200px] mt-2 mb-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-[150px]" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-[150px]" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            </div>

            <Skeleton className="h-6 w-[250px] mb-2" />
            <div className="space-y-2 mb-6">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[200px]" />
            </div>

            <div className="flex gap-4">
              <Skeleton className="h-10 w-[200px]" />
              <Skeleton className="h-10 w-[150px]" />
            </div>
          </div>
        </div>
      </section>

      {/* Barangay Councilors Skeleton */}
      <section className="mb-16">
        <Skeleton className="h-8 w-[250px] mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(4)
            .fill(null)
            .map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-64 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-[150px]" />
                  <Skeleton className="h-4 w-[200px] mt-2" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-[180px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-full" />
                </CardFooter>
              </Card>
            ))}
        </div>
      </section>

      {/* Other Officials Skeleton */}
      <section>
        <Skeleton className="h-8 w-[250px] mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array(3)
            .fill(null)
            .map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-[150px]" />
                  <Skeleton className="h-4 w-[180px] mt-2" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[180px]" />
                  <Skeleton className="h-4 w-[220px]" />
                </CardContent>
              </Card>
            ))}
        </div>
      </section>
    </div>
  )
}
