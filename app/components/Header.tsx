import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
        <Image
          src="/logo/logo-simbolo.png"
          alt="Logo Conrad"
          width={52}
          height={52}
          className="mr-2"
          priority
        />
        <span className="text-4xl font-bold tracking-tight">onrad</span>
      </div>
    </header>
  );
}
