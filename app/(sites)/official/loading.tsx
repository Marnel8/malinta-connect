import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="container py-10">
      <div className="mb-10">
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-4 w-[400px] mt-2" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {Array(4)
          .fill(null)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-[120px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px]" />
                <Skeleton className="h-3 w-[100px] mt-2" />
              </CardContent>
            </Card>
          ))}
      </div>

      <div className="mb-8">
        <Skeleton className="h-10 w-full" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Skeleton className="h-6 w-[200px]" />
              <Skeleton className="h-4 w-[300px] mt-2" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-[250px]" />
              <Skeleton className="h-10 w-[180px]" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(3)
              .fill(null)
              .map((_, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <Skeleton className="h-5 w-[200px]" />
                      <Skeleton className="h-4 w-[180px] mt-2" />
                      <Skeleton className="h-4 w-[160px] mt-1" />
                      <Skeleton className="h-4 w-[140px] mt-1" />
                    </div>
                    <div className="flex flex-col md:items-end gap-2">
                      <Skeleton className="h-5 w-[100px]" />
                      <div className="flex gap-2">
                        <Skeleton className="h-9 w-[100px]" />
                        <Skeleton className="h-9 w-[100px]" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Skeleton className="h-10 w-[100px]" />
          <Skeleton className="h-10 w-[100px]" />
        </CardFooter>
      </Card>
    </div>
  )
}
