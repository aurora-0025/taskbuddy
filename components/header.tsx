import { TbClipboardText } from "react-icons/tb";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import SignOut from "./signout-button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function Header() {
    const [user] = useAuthState(auth);
    return (
        <div className="flex w-full justify-between bg-[#FAEEFC] p-5 sm:h-[150px] sm:bg-transparent sm:p-20 sm:pb-2">
            <div className="flex items-center justify-center gap-2 text-black sm:justify-start">
                <TbClipboardText className="hidden h-full w-[24px] sm:block" />
                <h1 className="text-2xl font-semibold"> Task Buddy</h1>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <Avatar>
                                <AvatarImage src={user?.photoURL ?? undefined}/>
                                <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase() ?? ""}</AvatarFallback>
                            </Avatar>
                            <p className="hidden font-bold text-[#00000099] sm:block">
                                {user?.displayName}
                            </p>
                        </div>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <SignOut />
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
