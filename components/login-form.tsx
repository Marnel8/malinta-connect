"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
})

export function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useLanguage()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      onLogin()
    }, 1000)
  }

  return (
    <Tabs defaultValue="resident" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="resident" className="transition-all data-[state=active]:shadow-md">
          {t("login.resident")}
        </TabsTrigger>
        <TabsTrigger value="official" className="transition-all data-[state=active]:shadow-md">
          {t("login.official")}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="resident" className="animate-fade-in">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("login.email")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="your.email@example.com"
                      {...field}
                      className="transition-all focus-visible:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("login.password")}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      className="transition-all focus-visible:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="text-sm text-right">
              <Link href="/forgot-password" className="text-primary hover:underline">
                {t("login.forgotPassword")}
              </Link>
            </div>
            <Button type="submit" className="w-full transition-all duration-300 hover:shadow-md" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("login.loggingIn")}
                </>
              ) : (
                t("login.asResident")
              )}
            </Button>
            <div className="text-center text-sm text-muted-foreground mt-4">
              {t("login.registerPrompt")}{" "}
              <Link href="/register" className="text-primary hover:underline">
                {t("login.registerLink")}
              </Link>
            </div>
          </form>
        </Form>
      </TabsContent>
      <TabsContent value="official" className="animate-fade-in">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("login.officialEmail")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="official.email@barangay.gov"
                      {...field}
                      className="transition-all focus-visible:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("login.password")}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      className="transition-all focus-visible:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="text-sm text-right">
              <Link href="/forgot-password" className="text-primary hover:underline">
                {t("login.forgotPassword")}
              </Link>
            </div>
            <Button type="submit" className="w-full transition-all duration-300 hover:shadow-md" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("login.loggingIn")}
                </>
              ) : (
                t("login.asOfficial")
              )}
            </Button>
          </form>
        </Form>
      </TabsContent>
    </Tabs>
  )
}
