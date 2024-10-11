import Link from 'next/link';
import Image from 'next/image';

export const HeaderLogo = () => {
    return(
        <Link href ="/">
        <div className="items-center hidden lg:flex ">
            <Image src="/logo.svg" height={30} width={30} alt="Logo"></Image>
            <p className="font-semibold text-[#394149] text-2xl ml-2.5">
                Money Maestro
            </p>
        </div>
        </Link>
    )
}