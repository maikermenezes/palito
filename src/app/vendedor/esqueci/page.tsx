import type { Metadata } from "next";
import Link from "next/link";
import { IconBack } from "@/components/icons";

export const metadata: Metadata = { title: "Esqueci minha senha" };

export default function ForgotPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center gap-2 p-4">
        <Link
          href="/vendedor/login"
          aria-label="Voltar ao login"
          className="flex size-11 items-center justify-center rounded-[14px] border border-borda bg-white"
        >
          <IconBack />
        </Link>
        <h1 className="font-display text-[26px] font-semibold">Esqueci minha senha</h1>
      </header>
      <main className="flex flex-col gap-3 px-4 text-[15px] leading-relaxed">
        <p>A senha do vendedor é definida por quem cuida do servidor do app. Para trocar, rode no projeto:</p>
        <pre className="overflow-x-auto rounded-2xl bg-acai p-4 text-sm text-leite">
          npm run vendedor -- seu@email.com nova-senha
        </pre>
        <p className="text-suave">Depois é só entrar de novo com a senha nova.</p>
      </main>
    </div>
  );
}
