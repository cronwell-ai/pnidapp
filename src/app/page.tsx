import { ThemeToggle } from '@/components/theme/theme-toggle'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import GithubStarButton from '@/components/ui/github-star-button'
import Link from 'next/link'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Info } from 'lucide-react'

function BackgroundSVG() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 -z-10 h-full w-full stroke-gray-300 dark:stroke-white/30 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
    >
      <defs>
        <pattern
          x="50%"
          y={-1}
          id="0787a7c5-978c-4f66-83c7-11c213f99cb7"
          width={200}
          height={200}
          patternUnits="userSpaceOnUse"
        >
          <path d="M.5 200V.5H200" fill="none" />
        </pattern>
      </defs>
      <rect fill="url(#0787a7c5-978c-4f66-83c7-11c213f99cb7)" width="100%" height="100%" strokeWidth={0} />
    </svg>
  )
}

function DarkGradient() {
  return (
    <div
      aria-hidden="true"
      className="absolute left-[calc(50%-4rem)] top-10 -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:left-48 lg:top-[calc(50%-30rem)] xl:left-[calc(50%-24rem)]"
    >
      <div
        style={{
          clipPath:
            'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
        }}
        className="aspect-[1108/632] w-[69.25rem] bg-gradient-to-r from-brand-200 to-brand-800 opacity-20"
      />
    </div>
  )
}

function ProductScreen() {
  return (
    <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
      <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
        <div className="block dark:hidden -m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
          <img
            alt="App screenshot"
            src="https://i.ibb.co/6bPmPn6/labels-light.png"
            width={1350}
            height={800}
            className="w-[76rem] rounded-md shadow-2xl ring-1 ring-gray-900/10"
          />
        </div>
        <div className="hidden dark:block max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
          <img
            alt="App screenshot"
            src="https://i.ibb.co/S07bvPv/labels-dark.png"
            width={1350}
            height={800}
            className="w-[76rem] rounded-md bg-white/5 shadow-2xl ring-1 ring-white/10"
          />
        </div>
      </div>
    </div>
  )
}

export default async function Page() {
  const supabase = createClient()
  const res = await supabase.auth.getUser();
  const user = res.data?.user
  return (
    <div className="relative isolate overflow-hidden bg-background">
      <BackgroundSVG />
      <DarkGradient />
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 lg:flex lg:px-2 lg:pt-32">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-16">
          <div className='flex items-center justify-between'>
            <GithubStarButton user='cronwell-ai' repo='pnidapp' />
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className='text-md mt-1 bg-brand-500'>Beta</Badge>
                </TooltipTrigger>
                <TooltipContent className='flex p-3'>
                  <Info className='w-4 h-4 mr-2 mt-1' />
                  <p className='max-w-64'>This product is currently in <strong>Beta</strong>, meaning it is still in development and may contain bugs or incomplete features. We&apos;re actively improving it, and your feedback is valuable to us.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <h1 className="mt-10 text-4xl font-semibold tracking-tight text-primary sm:text-6xl">
            Label your <span><span className='hitext font-extrabold'>P&IDs</span></span> <br />for better reading
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Label P&ID documents with interactive valves, instruments, and equipment. Create a digital twin of your P&ID for more accessible reading and understanding. Get started now!
          </p>
          <div className="mt-10 flex items-center gap-x-6">
            {user && (
              <Link type="button" className="relative justify-center cursor-pointer inline-flex items-center space-x-2 text-center font-medium ease-out duration-200 rounded-md outline-none transition-all outline-0 focus-visible:outline-4 focus-visible:outline-offset-1 border bg-brand-400 dark:bg-brand-500 hover:bg-brand/80 dark:hover:bg-brand/50 border-brand-500/75 dark:border-brand/30 hover:border-brand-600 dark:hover:border-brand focus-visible:outline-brand-600 data-[state=open]:bg-brand-400/80 dark:data-[state=open]:bg-brand-500/80 data-[state=open]:outline-brand-600 text-sm px-4 py-2 h-[38px] text-white" href="/dashboard">
                <span className="truncate">Open Dashboard</span>
              </Link>
            )}
            {!user && (
              <>
                <Link type="button" className="relative justify-center cursor-pointer inline-flex items-center space-x-2 text-center font-medium ease-out duration-200 rounded-md outline-none transition-all outline-0 focus-visible:outline-4 focus-visible:outline-offset-1 border bg-brand-400 dark:bg-brand-500 hover:bg-brand/80 dark:hover:bg-brand/50 border-brand-500/75 dark:border-brand/30 hover:border-brand-600 dark:hover:border-brand focus-visible:outline-brand-600 data-[state=open]:bg-brand-400/80 dark:data-[state=open]:bg-brand-500/80 data-[state=open]:outline-brand-600 text-sm px-4 py-2 h-[38px] text-white w-[100px]" href="/auth/signup">
                  <span className="truncate">Sign Up</span>
                </Link>
                <Link href="/auth/login">
                  <Button variant={'outline'} className='w-[100px] h-min px-4 py-2 font-medium ease-out duration-200 rounded-md outline-none transition-all outline-0 focus-visible:outline-4 bg-muted focus-visible:outline-offset-1 border border-brand-500/75 dark:border-brand/30 hover:border-brand-600 dark:hover:border-brand focus-visible:outline-brand-600 data-[state=open]:bg-brand-400/80 dark:data-[state=open]:bg-brand-500/80 data-[state=open]:outline-brand-600'>
                    Log In
                  </Button>
                </Link>
              </>
            )}
            <ThemeToggle className="ml-auto mr-8" />
          </div>
        </div>
        <ProductScreen />
      </div>
    </div>
  )
}
