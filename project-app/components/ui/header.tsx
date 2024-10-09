import { HeaderLogo } from "@/components/ui/header-logo";
export const Header = () => {
    return(
        <header className="bg-gradient-to-b from-emerald-900 to-emerald-600 px-5 py-10 lg:px-15 pb-35">
            <div className="max-w-screen-2xl mx-auto">
                <div className="w-full flex items-center justify-between mb-15">
                    <div className="flex items-center lg:gap-x-15">
                        <HeaderLogo/>
                    </div>
                </div>
            </div>
        </header>
    )
}