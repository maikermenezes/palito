// Cria a conta do vendedor ou troca a senha dela.
// Uso: npm run vendedor -- email@exemplo.com senha-nova
import bcrypt from "bcryptjs";
import { db, users } from "../src/db";

async function main() {
  const [email, password] = process.argv.slice(2);
  if (!email || !password || password.length < 8) {
    console.error("Uso: npm run vendedor -- email@exemplo.com senha-com-8-ou-mais-caracteres");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db
    .insert(users)
    .values({ email: email.trim().toLowerCase(), passwordHash })
    .onConflictDoUpdate({ target: users.email, set: { passwordHash } });

  console.log(`Pronto: ${email} pode entrar em /vendedor/login`);
  process.exit(0);
}

main();
