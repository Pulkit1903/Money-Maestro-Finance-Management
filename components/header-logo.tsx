import Image from "next/image";
import Link from "next/link";

export const HeaderLogo = () => {
  return (
    <Link href="/">
      <div className="items-center hidden lg:flex">
        <Image src="/logo.svg" alt="Logo" height={28} width={28} />
        <p className="font-semibold text-[#394149] text-l ml-1">Money Maestro</p>
      </div>
    </Link>
  );
};
