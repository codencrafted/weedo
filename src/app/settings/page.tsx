"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, LogOut, AlertTriangle, Check, QrCode, Copy, Link as LinkIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";
import type { Task } from '@/lib/types';
import { Expandable, ExpandableContent } from '@/components/ui/expandable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PopoverRoot, PopoverTrigger, PopoverContent, PopoverForm, PopoverInput, PopoverFooter, PopoverCloseButton, PopoverSubmitButton, PopoverHeader, PopoverBody } from "@/components/ui/popover-animated";
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import QRCode from 'qrcode.react';
import { createShareLink } from '@/app/actions/share';


const getInitials = (name: string | null): string => {
    if (!name) return '';
    const names = name.trim().split(' ').filter(n => n);
    if (names.length === 0) return '';
    if (names.length === 1) {
        return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [name, setName] = useState<string | null>(null);
  const [initials, setInitials] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [openConfirmation, setOpenConfirmation] = useState<string | null>(null);

  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isQRCodeDialogOpen, setIsQRCodeDialogOpen] = useState(false);
  const [syncUrl, setSyncUrl] = useState('');
  const [qrBgColor, setQrBgColor] = useState('#FFFFFF');
  const [qrFgColor, setQrFgColor] = useState('#09090b');

  useEffect(() => {
    try {
      const storedName = localStorage.getItem('weedo-name');
      if (storedName) {
        setName(storedName);
        setInitials(getInitials(storedName));
      }
    } catch (error) {
      console.error("Could not access local storage", error);
    } finally {
        setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    if (isQRCodeDialogOpen) {
      // Resolve CSS variables to actual colors for the QR code library
      try {
        const bgStyle = getComputedStyle(document.documentElement).getPropertyValue('--card').trim();
        const fgStyle = getComputedStyle(document.documentElement).getPropertyValue('--card-foreground').trim();
        setQrBgColor(`hsl(${bgStyle})`);
        setQrFgColor(`hsl(${fgStyle})`);
      } catch (e) {
        console.error("Could not compute QR colors", e);
      }
    }
  }, [isQRCodeDialogOpen]);

  const handleNameSave = (newName: string) => {
    if (newName.trim()) {
      try {
        const trimmedName = newName.trim();
        localStorage.setItem('weedo-name', trimmedName);
        setName(trimmedName);
        setInitials(getInitials(trimmedName));
        toast({
          title: "Name Updated",
          description: "Your name has been successfully changed.",
        });
      } catch (error) {
         toast({
          variant: "destructive",
          title: "Error",
          description: "Could not save your name.",
        })
      }
    }
  };

  const handleUncompleteAll = () => {
    try {
      const storedTasks = localStorage.getItem('weedo-tasks');
      if (storedTasks) {
        const tasks: Task[] = JSON.parse(storedTasks);
        const uncompletedTasks = tasks.map(task => ({ ...task, completed: false }));
        localStorage.setItem('weedo-tasks', JSON.stringify(uncompletedTasks));
        toast({
            title: "Tasks Updated",
            description: "All tasks have been marked as incomplete.",
        });
      }
    } catch (error) {
      console.error("Could not update tasks", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update tasks.",
      })
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('weedo-name');
      localStorage.removeItem('weedo-tasks');
      localStorage.removeItem('weedo-tasks-initialized');
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push('/');
    } catch (error) {
      console.error("Could not access local storage", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not log out.",
      })
    }
  };
  
  const generateShareableData = async () => {
    setIsGenerating(true);
    try {
      const storedName = localStorage.getItem('weedo-name');
      const storedTasks = localStorage.getItem('weedo-tasks');

      if (!storedName || !storedTasks) {
        toast({
          variant: "destructive",
          title: "Cannot Share",
          description: "No data found to share.",
        });
        return null;
      }

      const data = {
        name: storedName,
        tasks: JSON.parse(storedTasks) as Task[],
      };

      const result = await createShareLink(data);

      if (result.success && result.id) {
        const url = `${window.location.origin}/share/${result.id}`;
        setSyncUrl(url);
        return url;
      } else {
        throw new Error(result.error || 'An unknown error occurred.');
      }
    } catch (error: any) {
      console.error("Failed to generate share link:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not generate share link.",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateLinkClick = async () => {
    const url = await generateShareableData();
    if (url) {
        setIsLinkDialogOpen(true);
    }
  };

  const handleGenerateQRCodeClick = async () => {
    const url = await generateShareableData();
    if (url) {
        setIsQRCodeDialogOpen(true);
    }
  };

  const handleCopyLink = () => {
    if (!syncUrl) return;
    navigator.clipboard.writeText(syncUrl).then(() => {
      toast({ title: "Copied!", description: "Share link copied to clipboard." });
    });
  };
  
  const confirmationVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, y: 10, scale: 0.98, transition: { duration: 0.2, ease: 'easeIn' } }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="flex flex-col items-center justify-center min-h-screen bg-background p-4"
    >
      <div className="w-full max-w-md">
        <div className="mb-6 self-start">
            <Link href="/" passHref>
              <Button variant="ghost" className="hover:bg-transparent" asChild>
                <motion.div
                  className="flex items-center cursor-pointer"
                  initial="rest"
                  whileHover="hover"
                  whileTap={{scale: 0.98}}
                >
                  <motion.div
                    variants={{ hover: { x: -4 }, rest: { x: 0 } }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="mr-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </motion.div>
                  <span>Back to Tasks</span>
                </motion.div>
              </Button>
            </Link>
        </div>

        <div className="w-full">
            <div className="flex flex-col items-center text-center p-6 pt-0">
               {isLoading ? (
                <>
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <Skeleton className="h-6 w-32 mt-4" />
                    <Skeleton className="h-4 w-48 mt-2" />
                </>
              ) : (
                <>
                  <Avatar className="h-24 w-24 mb-4 text-3xl">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-center w-full">
                     <PopoverRoot initialValue={name ?? ""}>
                        <PopoverTrigger asChild>
                           <h2 className="text-2xl font-semibold leading-none tracking-tight cursor-pointer hover:text-primary transition-colors">{name}</h2>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 h-auto">
                          <PopoverForm onSubmit={handleNameSave}>
                            <div className="flex flex-col h-full bg-card text-card-foreground">
                                <PopoverHeader>Edit your name</PopoverHeader>
                                <PopoverBody>
                                    <PopoverInput placeholder="Enter your new name" />
                                </PopoverBody>
                                <PopoverFooter className="bg-transparent border-0 justify-end gap-2 p-3">
                                  <PopoverCloseButton asChild>
                                    <Button variant="ghost" type="button">Cancel</Button>
                                  </PopoverCloseButton>
                                  <PopoverSubmitButton>
                                    <Check className="h-4 w-4 mr-2" /> Save
                                  </PopoverSubmitButton>
                                </PopoverFooter>
                              </div>
                          </PopoverForm>
                        </PopoverContent>
                      </PopoverRoot>
                    <p className="text-sm text-muted-foreground mt-1.5">Manage your app settings.</p>
                  </div>
                </>
              )}
            </div>
            
            <div className="p-6 pt-0">
                <h3 className="text-sm font-medium text-muted-foreground mb-1 px-3">Account</h3>
                <div className="flex flex-col gap-1">
                    <div>
                        <Button variant="ghost" className="w-full justify-start text-left text-base p-3 h-auto hover:bg-transparent" onClick={() => setOpenConfirmation(p => p === 'uncomplete' ? null : 'uncomplete')}>
                            <RefreshCw className="mr-3 h-5 w-5" />
                            <div>
                                <p>Mark All Incomplete</p>
                                <p className="text-xs text-muted-foreground font-normal">Reset the completion status of all tasks.</p>
                            </div>
                        </Button>
                        <Expandable expanded={openConfirmation === 'uncomplete'}>
                            <ExpandableContent>
                               <motion.div variants={confirmationVariants} initial="hidden" animate="visible" exit="exit" className="rounded-lg border bg-card p-4 mt-2">
                                  <div className="flex items-start gap-3">
                                      <AlertTriangle className="h-5 w-5 mt-0.5 text-destructive shrink-0"/>
                                      <div>
                                          <p className="font-semibold">Are you sure?</p>
                                          <p className="text-sm text-muted-foreground mt-1">This will mark all of your tasks as incomplete. This action cannot be undone.</p>
                                      </div>
                                  </div>
                                  <div className="flex justify-end gap-2 mt-4">
                                      <Button variant="ghost" onClick={() => setOpenConfirmation(null)}>Cancel</Button>
                                      <Button onClick={() => { handleUncompleteAll(); setOpenConfirmation(null); }}>Continue</Button>
                                  </div>
                              </motion.div>
                           </ExpandableContent>
                        </Expandable>
                    </div>
                 
                    <div>
                        <Button variant="ghost" className="w-full justify-start text-left text-base text-destructive p-3 h-auto hover:bg-transparent" onClick={() => setOpenConfirmation(p => p === 'logout' ? null : 'logout')}>
                            <LogOut className="mr-3 h-5 w-5" />
                            <div>
                               <p>Logout</p>
                               <p className="text-xs text-muted-foreground font-normal">This will clear your name and task data.</p>
                           </div>
                       </Button>
                        <Expandable expanded={openConfirmation === 'logout'}>
                            <ExpandableContent>
                               <motion.div variants={confirmationVariants} initial="hidden" animate="visible" exit="exit" className="rounded-lg border bg-card p-4 mt-2">
                                  <div className="flex items-start gap-3">
                                      <AlertTriangle className="h-5 w-5 mt-0.5 text-destructive shrink-0"/>
                                      <div>
                                          <p className="font-semibold">Are you sure you want to log out?</p>
                                          <p className="text-sm text-muted-foreground mt-1">This will permanently delete all your data. This action cannot be undone.</p>
                                      </div>
                                  </div>
                                  <div className="flex justify-end gap-2 mt-4">
                                      <Button variant="ghost" onClick={() => setOpenConfirmation(null)}>Cancel</Button>
                                      <Button variant="destructive" onClick={() => { handleLogout(); setOpenConfirmation(null); }}>Logout</Button>
                                  </div>
                              </motion.div>
                           </ExpandableContent>
                        </Expandable>
                    </div>
                </div>
            </div>

            <Separator className="my-2"/>

            <div className="p-6 pt-2">
                <h3 className="text-sm font-medium text-muted-foreground mb-1 px-3">Data Sync</h3>
                <div className="flex flex-col gap-1">
                    <Button variant="ghost" className="w-full justify-start text-left text-base p-3 h-auto hover:bg-transparent" onClick={handleGenerateLinkClick} disabled={isGenerating}>
                        <LinkIcon className="mr-3 h-5 w-5" />
                        <div>
                            <p>Share via Link</p>
                            <p className="text-xs text-muted-foreground font-normal">Generate a shareable link.</p>
                        </div>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-left text-base p-3 h-auto hover:bg-transparent" onClick={handleGenerateQRCodeClick} disabled={isGenerating}>
                        <QrCode className="mr-3 h-5 w-5" />
                        <div>
                            <p>Share via QR Code</p>
                            <p className="text-xs text-muted-foreground font-normal">Generate a scannable QR code.</p>
                        </div>
                    </Button>
                </div>
            </div>

        </div>
      </div>
      
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Share via Link</DialogTitle>
                  <DialogDescription>
                      Copy and open this link on another device to import your data.
                  </DialogDescription>
              </DialogHeader>
              <div className="flex items-center space-x-2 pt-4">
                  <Input value={syncUrl} readOnly />
                  <Button type="button" size="icon" onClick={handleCopyLink}>
                      <Copy className="h-4 w-4" />
                       <span className="sr-only">Copy Link</span>
                  </Button>
              </div>
          </DialogContent>
      </Dialog>
      
      <Dialog open={isQRCodeDialogOpen} onOpenChange={setIsQRCodeDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Share via QR Code</DialogTitle>
                  <DialogDescription>
                      Scan this QR code on another device to import your data.
                  </DialogDescription>
              </DialogHeader>
              <div className="flex justify-center py-4">
                  {syncUrl && <QRCode value={syncUrl} size={256} bgColor={qrBgColor} fgColor={qrFgColor} />}
              </div>
          </DialogContent>
      </Dialog>

    </motion.div>
  );
}
