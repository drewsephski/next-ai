"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import UserProfile from "@/components/user-profile";
import {
  Brush,
  HomeIcon,
  LucideGitBranchPlus,
  MonitorSmartphone,
} from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

const WordmarkIcon = (props: React.ComponentProps<"svg">) => (
	<svg width="50" height="40" viewBox="0 0 77 41" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
<path d="M45.0353 4.66312C45.8331 3.77669 46.7195 3.04539 47.6281 2.46921C49.2236 1.47198 50.9079 0.940125 52.6364 0.940125V15.411C51.3732 11.0232 48.6475 7.25591 45.0353 4.66312ZM66.5533 40.9401H15.2957C6.87461 40.9401 0.0712891 34.1146 0.0712891 25.7157C0.0712891 17.6714 6.3206 11.0675 14.232 10.5135V0.940125C16.0048 0.940125 17.7555 1.44982 19.3954 2.46921C20.304 3.02323 21.1904 3.75453 21.9882 4.59663C25.2458 2.31409 29.1904 0.984446 33.4674 0.984446C33.4674 10.2254 30.1433 20.9734 19.3289 20.9955H33.3566C32.9577 19.2005 31.3178 17.8709 29.3677 17.8487H37.5228C35.5727 17.8487 33.9328 19.2005 33.5339 21.0177H46.6087C49.2236 21.0177 51.8164 21.5274 54.2541 22.5468C56.6696 23.544 58.8857 25.0288 60.725 26.8681C62.5865 28.7296 64.0491 30.9235 65.0464 33.339C66.0436 35.7324 66.5533 38.3252 66.5533 40.9401ZM22.8525 10.7795C23.1849 11.6437 24.0713 12.6188 25.3123 13.3279C26.5533 14.0371 27.8386 14.3252 28.7472 14.1922C28.4148 13.3279 27.5284 12.3529 26.2874 11.6437C25.0464 10.9346 23.761 10.6465 22.8525 10.7795ZM41.5117 13.3279C40.2707 14.0371 38.9854 14.3252 38.0768 14.1922C38.4092 13.3279 39.2957 12.3529 40.5367 11.6437C41.7777 10.9346 43.063 10.6465 43.9716 10.7795C43.6613 11.6437 42.7527 12.6188 41.5117 13.3279Z" fill="#283841"></path>
</svg>
);

export default function DashboardTopNav({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col">
      <header className="flex h-14 lg:h-[52px] items-center gap-4 border-b px-3">
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <WordmarkIcon className="h-8 w-auto" />
        </Link>
        <Dialog>
          <SheetTrigger className="min-[1024px]:hidden p-2 transition">
            <Link prefetch={true} href="/dashboard">
              <span className="sr-only">Home</span>
            </Link>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <Link prefetch={true} href="/">
                <SheetTitle>Pass Builder</SheetTitle>
              </Link>
            </SheetHeader>
            <div className="flex flex-col space-y-3 mt-4">
              <DialogClose asChild>
                <Link prefetch={true} href="/dashboard">
                  <Button variant="outline" className="w-full">
                    <HomeIcon className="mr-2 h-4 w-4" />
                    Overview
                  </Button>
                </Link>
              </DialogClose>
              <DialogClose asChild>
                <Link prefetch={true} href="/dashboard/create">
                  <Button variant="outline" className="w-full">
                    <Brush className="mr-2 h-4 w-4" />
                    Create Pass
                  </Button>
                </Link>
              </DialogClose>
              <DialogClose asChild>
                <Link prefetch={true} href="/dashboard/notifications">
                  <Button variant="outline" className="w-full">
                    <MonitorSmartphone className="mr-2 h-4 w-4" />
                    Notifications
                  </Button>
                </Link>
              </DialogClose>
              <Separator className="my-3" />
              <DialogClose asChild>
                <Link prefetch={true} href="/dashboard/analytics">
                  <Button variant="outline" className="w-full">
                    <LucideGitBranchPlus className="mr-2 h-4 w-4" />
                    Analytics
                  </Button>
                </Link>
              </DialogClose>
            </div>
          </SheetContent>
        </Dialog>
        <div className="flex justify-center items-center gap-2 ml-auto">
          <AnimatedThemeToggler className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors" />
          <UserProfile mini={true} />
        </div>
      </header>
      {children}
    </div>
  );
}
