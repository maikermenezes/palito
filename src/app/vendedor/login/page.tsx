import type { Metadata } from "next";
import { Popsicle } from "@/components/Popsicle";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Área do vendedor" };

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col bg-acai">
      <div className="flex flex-1 flex-col items-center justify-center gap-1.5 p-6">
        <Popsicle body="#E8436B" top="#FFB238" width={64} />
        <div className="font-display text-[52px] leading-none font-bold tracking-tight text-leite">palito</div>
        <div className="text-[15px] font-bold text-manga">Área do vendedor</div>
      </div>
      <LoginForm />
    </div>
  );
}
